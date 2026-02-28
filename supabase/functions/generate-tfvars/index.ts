import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const VALID_NETWORK_MODELS = ['shared_vpc', 'per_project', 'shared-vpc', 'per-project', 'hub-spoke'];
const VALID_IAM_MODELS = ['centralized', 'federated', 'hybrid'];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GITHUB_TOKEN = Deno.env.get('GITHUB_TOKEN');
    const GITHUB_REPO = Deno.env.get('GITHUB_REPO');
    const GITHUB_BRANCH = Deno.env.get('GITHUB_BRANCH') || 'main';

    if (!GITHUB_TOKEN) throw new Error('GITHUB_TOKEN is not configured');
    if (!GITHUB_REPO) throw new Error('GITHUB_REPO is not configured');

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const submissionId = pathParts[pathParts.length - 1];

    // Also accept submissionId from body
    let bodySubmissionId: string | undefined;
    if (req.method === 'POST') {
      try {
        const body = await req.json();
        bodySubmissionId = body.submissionId;
      } catch {
        // no body
      }
    }

    const finalId = submissionId && submissionId !== 'generate-tfvars' ? submissionId : bodySubmissionId;
    if (!finalId) {
      return new Response(JSON.stringify({ error: 'submissionId is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch submission from database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: submission, error: fetchError } = await supabase
      .from('submissions')
      .select('*')
      .eq('id', finalId)
      .single();

    if (fetchError || !submission) {
      return new Response(JSON.stringify({ error: 'Submission not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Identity Gate validation
    if (!submission.workspace_exists || !submission.org_id) {
      return new Response(JSON.stringify({ error: 'Organization must exist before Terraform generation.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate
    if (submission.org_id && !/^\d+$/.test(submission.org_id)) {
      return new Response(JSON.stringify({ error: 'orgId must be numeric' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const normalizedNetwork = (submission.network_model || '').replace('-', '_');
    if (submission.network_model && !VALID_NETWORK_MODELS.includes(submission.network_model) && !VALID_NETWORK_MODELS.includes(normalizedNetwork)) {
      return new Response(JSON.stringify({ error: `networkModel must be one of: shared_vpc, per_project, hub_spoke` }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (submission.iam_model && !VALID_IAM_MODELS.includes(submission.iam_model)) {
      return new Response(JSON.stringify({ error: `iamModel must be one of: centralized, federated, hybrid` }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Map to Terraform schema
    const tfvars = {
      customer_name: submission.company_name || '',
      org_id: submission.org_id || '',
      billing_account: submission.billing_account || '',
      environments: submission.environments || [],
      network_model: normalizedNetwork || '',
      iam_model: submission.iam_model || '',
      cis_level: submission.cis_level || '',
      regions: submission.regions || [],
      budget_threshold: submission.budget_threshold ? Number(submission.budget_threshold) : 0,
    };

    const tfvarsContent = JSON.stringify(tfvars, null, 2);
    const contentBase64 = btoa(unescape(encodeURIComponent(tfvarsContent)));

    // Sanitize customer name for path
    const customerName = (submission.company_name || 'unknown')
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const filePath = `environments/${customerName}/terraform.tfvars.json`;

    // Check if file exists (to get SHA for update)
    let existingSha: string | undefined;
    const getResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}?ref=${GITHUB_BRANCH}`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (getResponse.ok) {
      const existing = await getResponse.json();
      existingSha = existing.sha;
    } else {
      await getResponse.text(); // consume body
    }

    // Create or update file
    const putBody: Record<string, string> = {
      message: `${existingSha ? 'Update' : 'Add'} Terraform tfvars for ${submission.company_name || customerName}`,
      content: contentBase64,
      branch: GITHUB_BRANCH,
    };
    if (existingSha) {
      putBody.sha = existingSha;
    }

    const putResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(putBody),
      }
    );

    if (!putResponse.ok) {
      const errBody = await putResponse.text();
      throw new Error(`GitHub API error [${putResponse.status}]: ${errBody}`);
    }

    const putResult = await putResponse.json();

    // Update submission status
    await supabase
      .from('submissions')
      .update({ status: 'TF Generated' })
      .eq('id', finalId);

    return new Response(JSON.stringify({
      success: true,
      file_path: filePath,
      commit_url: putResult.commit?.html_url || '',
      message: `Terraform tfvars ${existingSha ? 'updated' : 'created'} for ${submission.company_name}`,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error generating tfvars:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
