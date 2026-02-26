import { getOpenAIClient } from "../client";

interface AiActivityAuditorRequest {
  company_department: string;
  ai_tools_list: string;
  time_period: string;
  data_categories_processed: string;
  regulatory_framework: string;
}

interface AiActivityAuditorResponse {
  report_title: string;
  executive_summary: string;
  systems_inventory: {
    tool_name: string;
    vendor: string;
    purpose: string;
    deployment_status: string;
    risk_tier: string;
  }[];
  user_activity_patterns: {
    summary: string;
    active_user_estimate: string;
    usage_frequency: string;
    peak_usage_periods: string;
    notable_patterns: string[];
  };
  data_handling_summary: {
    categories_processed: string[];
    data_flow_description: string;
    storage_and_retention: string;
    third_party_sharing: string;
    encryption_and_security_notes: string;
  };
  bias_and_risk_flags: {
    flag_id: string;
    severity: string;
    description: string;
    affected_system: string;
    recommended_action: string;
  }[];
  control_gaps: {
    gap_id: string;
    category: string;
    description: string;
    regulatory_reference: string;
    remediation_priority: string;
    recommended_remediation: string;
  }[];
  governance_evidence: {
    policies_in_place: string[];
    oversight_mechanisms: string[];
    training_and_awareness: string;
    incident_response_readiness: string;
    board_reporting_status: string;
  };
  regulatory_alignment: {
    framework: string;
    compliance_score: string;
    key_obligations_met: string[];
    key_obligations_gaps: string[];
  };
  recommendations: string[];
  report_metadata: {
    department: string;
    time_period: string;
    generated_at: string;
    disclaimer: string;
  };
}

export async function aiActivityAuditor(
  input: AiActivityAuditorRequest
): Promise<{ result: AiActivityAuditorResponse; tokens: number; cost: number }> {
  const openai = getOpenAIClient();

  if (!input.company_department || typeof input.company_department !== "string" || input.company_department.trim().length === 0) {
    throw new Error("Validation error: 'company_department' is required and must be a non-empty string.");
  }
  if (input.company_department.trim().length > 500) {
    throw new Error("Validation error: 'company_department' must not exceed 500 characters.");
  }

  if (!input.ai_tools_list || typeof input.ai_tools_list !== "string" || input.ai_tools_list.trim().length === 0) {
    throw new Error("Validation error: 'ai_tools_list' is required and must be a non-empty string.");
  }
  if (input.ai_tools_list.trim().length > 2000) {
    throw new Error("Validation error: 'ai_tools_list' must not exceed 2000 characters.");
  }

  if (!input.time_period || typeof input.time_period !== "string" || input.time_period.trim().length === 0) {
    throw new Error("Validation error: 'time_period' is required and must be a non-empty string.");
  }
  if (input.time_period.trim().length > 200) {
    throw new Error("Validation error: 'time_period' must not exceed 200 characters.");
  }

  if (!input.data_categories_processed || typeof input.data_categories_processed !== "string" || input.data_categories_processed.trim().length === 0) {
    throw new Error("Validation error: 'data_categories_processed' is required and must be a non-empty string.");
  }
  if (input.data_categories_processed.trim().length > 2000) {
    throw new Error("Validation error: 'data_categories_processed' must not exceed 2000 characters.");
  }

  if (!input.regulatory_framework || typeof input.regulatory_framework !== "string" || input.regulatory_framework.trim().length === 0) {
    throw new Error("Validation error: 'regulatory_framework' is required and must be a non-empty string.");
  }
  if (input.regulatory_framework.trim().length > 500) {
    throw new Error("Validation error: 'regulatory_framework' must not exceed 500 characters.");
  }

  const sanitizedDepartment = input.company_department.trim();
  const sanitizedTools = input.ai_tools_list.trim();
  const sanitizedTimePeriod = input.time_period.trim();
  const sanitizedDataCategories = input.data_categories_processed.trim();
  const sanitizedFramework = input.regulatory_framework.trim();

  const systemPrompt = `You are an expert AI governance and compliance auditor. Your role is to generate thorough, compliance-ready audit reports documenting AI tool usage within enterprise departments. You produce structured, factual, and actionable reports suitable for regulatory review and board-level presentation.

You must output ONLY valid JSON matching the exact schema specified. Do not include any markdown, code fences, or explanatory text outside the JSON object.

The JSON schema you must follow:
{
  "report_title": "string",
  "executive_summary": "string (2-4 paragraphs summarizing findings)",
  "systems_inventory": [
    {
      "tool_name": "string",
      "vendor": "string",
      "purpose": "string",
      "deployment_status": "string (e.g., Production, Pilot, Deprecated)",
      "risk_tier": "string (High, Medium, Low)"
    }
  ],
  "user_activity_patterns": {
    "summary": "string",
    "active_user_estimate": "string",
    "usage_frequency": "string",
    "peak_usage_periods": "string",
    "notable_patterns": ["string"]
  },
  "data_handling_summary": {
    "categories_processed": ["string"],
    "data_flow_description": "string",
    "storage_and_retention": "string",
    "third_party_sharing": "string",
    "encryption_and_security_notes": "string"
  },
  "bias_and_risk_flags": [
    {
      "flag_id": "string (e.g., RISK-001)",
      "severity": "string (Critical, High, Medium, Low)",
      "description": "string",
      "affected_system": "string",
      "recommended_action": "string"
    }
  ],
  "control_gaps": [
    {
      "gap_id": "string (e.g., GAP-001)",
      "category": "string (e.g., Access Control, Data Governance, Model Oversight)",
      "description": "string",
      "regulatory_reference": "string",
      "remediation_priority": "string (Critical, High, Medium, Low)",
      "recommended_remediation": "string"
    }
  ],
  "governance_evidence": {
    "policies_in_place": ["string"],
    "oversight_mechanisms": ["string"],
    "training_and_awareness": "string",
    "incident_response_readiness": "string",
    "board_reporting_status": "string"
  },
  "regulatory_alignment": {
    "framework": "string",
    "compliance_score": "string (e.g., 72/100 or Partial)",
    "key_obligations_met": ["string"],
    "key_obligations_gaps": ["string"]
  },
  "recommendations": ["string"],
  "report_metadata": {
    "department": "string",
    "time_period": "string",
    "generated_at": "string (ISO 8601)",
    "disclaimer": "string"
  }
}

IMPORTANT GUIDELINES:
- Be thorough, specific, and professional.
- Base your analysis on the provided AI tools, data categories, and regulatory framework.
- Identify realistic risks, control gaps, and governance evidence based on common enterprise patterns.
- All flag_id and gap_id values must be unique.
- The disclaimer must state this is an AI-generated audit report and should be reviewed by qualified compliance professionals before regulatory submission.
- Do not fabricate specific employee names or exact numerical metrics; use reasonable estimates and ranges.
- Ensure the report is suitable for regulatory presentation under the specified framework.`;

  const userPrompt = `Generate a comprehensive AI Activity Audit Report with the following parameters:

**Department/Business Unit:** ${sanitizedDepartment}

**AI Tools & Systems in Use:**
${sanitizedTools}

**Audit Time Period:** ${sanitizedTimePeriod}

**Data Categories Processed by AI Systems:**
${sanitizedDataCategories}

**Applicable Regulatory Framework:** ${sanitizedFramework}

Please generate the full compliance audit report as a JSON object following the exact schema provided in your instructions. Ensure all sections are thoroughly completed with actionable insights.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.4,
    max_tokens: 4096,
    response_format: { type: "json_object" },
  });

  const tokens = response.usage?.total_tokens || 0;
  const cost = tokens * 0.000005;

  const content = response.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("AI model returned an empty response. Please try again.");
  }

  let parsed: AiActivityAuditorResponse;
  try {
    parsed = JSON.parse(content) as AiActivityAuditorResponse;
  } catch (parseError) {
    throw new Error("Failed to parse AI model response as valid JSON. Please try again.");
  }

  if (!parsed.report_title || !parsed.executive_summary || !parsed.systems_inventory) {
    throw new Error("AI model returned an incomplete audit report structure. Please try again.");
  }

  const now = new Date().toISOString();
  if (!parsed.report_metadata) {
    parsed.report_metadata = {
      department: sanitizedDepartment,
      time_period: sanitizedTimePeriod,
      generated_at: now,
      disclaimer: "This is an AI-generated audit report. It should be reviewed by qualified compliance professionals before regulatory submission.",
    };
  } else {
    parsed.report_metadata.generated_at = now;
    if (!parsed.report_metadata.department) {
      parsed.report_metadata.department = sanitizedDepartment;
    }
    if (!parsed.report_metadata.time_period) {
      parsed.report_metadata.time_period = sanitizedTimePeriod;
    }
  }

  return { result: parsed, tokens, cost };
}
