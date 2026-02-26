import { getOpenAIClient } from "../client";

interface AiReadinessAuditorRequest {
  data_sources_description: string;
  current_governance_level: string;
  compliance_requirements: string;
  use_case_domain: string;
  team_size: string;
  data_volume_estimate: string;
}

interface DataQualityScore {
  dimension: string;
  score: number;
  description: string;
  findings: string[];
}

interface ComplianceGap {
  requirement: string;
  current_state: string;
  gap_description: string;
  severity: "critical" | "high" | "medium" | "low";
  recommended_action: string;
}

interface GovernanceFrameworkItem {
  category: string;
  policy_name: string;
  description: string;
  responsible_role: string;
  implementation_priority: "immediate" | "short_term" | "medium_term" | "long_term";
}

interface RemediationStep {
  priority: number;
  title: string;
  description: string;
  effort_estimate: string;
  impact: "critical" | "high" | "medium" | "low";
  dependencies: string[];
  estimated_timeline: string;
}

interface RiskItem {
  risk_category: string;
  description: string;
  likelihood: "high" | "medium" | "low";
  impact: "critical" | "high" | "medium" | "low";
  mitigation_strategy: string;
}

interface ChecklistItem {
  phase: string;
  task: string;
  completed: boolean;
  notes: string;
}

interface AiReadinessAuditorResponse {
  executive_summary: string;
  overall_readiness_score: number;
  data_quality_scores: DataQualityScore[];
  compliance_gap_analysis: ComplianceGap[];
  governance_framework_template: GovernanceFrameworkItem[];
  remediation_roadmap: RemediationStep[];
  risk_assessment: RiskItem[];
  implementation_checklist: ChecklistItem[];
  key_recommendations: string[];
  estimated_time_to_readiness: string;
}

export async function aiReadinessAuditor(
  input: AiReadinessAuditorRequest
): Promise<{ result: AiReadinessAuditorResponse; tokens: number; cost: number }> {
  const openai = getOpenAIClient();

  if (!input.data_sources_description || typeof input.data_sources_description !== "string" || input.data_sources_description.trim().length === 0) {
    throw new Error("data_sources_description is required and must be a non-empty string.");
  }
  if (input.data_sources_description.trim().length < 20) {
    throw new Error("data_sources_description must be at least 20 characters to provide a meaningful audit.");
  }
  if (input.data_sources_description.trim().length > 10000) {
    throw new Error("data_sources_description must not exceed 10000 characters.");
  }

  if (!input.current_governance_level || typeof input.current_governance_level !== "string" || input.current_governance_level.trim().length === 0) {
    throw new Error("current_governance_level is required and must be a non-empty string.");
  }
  const validGovernanceLevels = ["none", "minimal", "basic", "intermediate", "advanced", "mature"];
  if (!validGovernanceLevels.includes(input.current_governance_level.trim().toLowerCase())) {
    throw new Error(`current_governance_level must be one of: ${validGovernanceLevels.join(", ")}.`);
  }

  if (!input.compliance_requirements || typeof input.compliance_requirements !== "string" || input.compliance_requirements.trim().length === 0) {
    throw new Error("compliance_requirements is required and must be a non-empty string.");
  }
  if (input.compliance_requirements.trim().length > 5000) {
    throw new Error("compliance_requirements must not exceed 5000 characters.");
  }

  if (!input.use_case_domain || typeof input.use_case_domain !== "string" || input.use_case_domain.trim().length === 0) {
    throw new Error("use_case_domain is required and must be a non-empty string.");
  }
  if (input.use_case_domain.trim().length > 2000) {
    throw new Error("use_case_domain must not exceed 2000 characters.");
  }

  if (!input.team_size || typeof input.team_size !== "string" || input.team_size.trim().length === 0) {
    throw new Error("team_size is required and must be a non-empty string.");
  }
  if (input.team_size.trim().length > 200) {
    throw new Error("team_size must not exceed 200 characters.");
  }

  if (!input.data_volume_estimate || typeof input.data_volume_estimate !== "string" || input.data_volume_estimate.trim().length === 0) {
    throw new Error("data_volume_estimate is required and must be a non-empty string.");
  }
  if (input.data_volume_estimate.trim().length > 500) {
    throw new Error("data_volume_estimate must not exceed 500 characters.");
  }

  const sanitizedInput = {
    data_sources_description: input.data_sources_description.trim(),
    current_governance_level: input.current_governance_level.trim().toLowerCase(),
    compliance_requirements: input.compliance_requirements.trim(),
    use_case_domain: input.use_case_domain.trim(),
    team_size: input.team_size.trim(),
    data_volume_estimate: input.data_volume_estimate.trim(),
  };

  const systemPrompt = `You are an expert AI Readiness Auditor with deep expertise in data governance, data quality assessment, regulatory compliance, and enterprise AI deployment strategy. Your role is to perform comprehensive audits of enterprise data sources to determine their readiness for AI/ML initiatives.

You must analyze the provided information about an organization's data landscape and produce a thorough, actionable audit report. Your analysis should be precise, evidence-based (from the information provided), and practical.

You MUST respond with valid JSON matching this exact structure:
{
  "executive_summary": "A concise 3-5 sentence summary of the overall AI readiness state, key findings, and top-priority actions.",
  "overall_readiness_score": <number from 0 to 100>,
  "data_quality_scores": [
    {
      "dimension": "<quality dimension name, e.g., Completeness, Accuracy, Consistency, Timeliness, Uniqueness, Validity, Accessibility, Lineage>",
      "score": <number from 0 to 100>,
      "description": "<brief explanation of this dimension's assessment>",
      "findings": ["<specific finding 1>", "<specific finding 2>"]
    }
  ],
  "compliance_gap_analysis": [
    {
      "requirement": "<specific compliance requirement>",
      "current_state": "<description of current state>",
      "gap_description": "<what is missing or inadequate>",
      "severity": "<critical|high|medium|low>",
      "recommended_action": "<specific action to close the gap>"
    }
  ],
  "governance_framework_template": [
    {
      "category": "<governance category, e.g., Data Ownership, Access Control, Quality Management, Metadata Management, Privacy, Lifecycle Management>",
      "policy_name": "<name of the policy>",
      "description": "<what this policy covers and why it matters for AI readiness>",
      "responsible_role": "<role responsible for this policy>",
      "implementation_priority": "<immediate|short_term|medium_term|long_term>"
    }
  ],
  "remediation_roadmap": [
    {
      "priority": <number starting from 1>,
      "title": "<remediation step title>",
      "description": "<detailed description of the remediation action>",
      "effort_estimate": "<estimated effort, e.g., 2 weeks, 1 month>",
      "impact": "<critical|high|medium|low>",
      "dependencies": ["<dependency 1>", "<dependency 2>"],
      "estimated_timeline": "<e.g., Week 1-2, Month 1-2>"
    }
  ],
  "risk_assessment": [
    {
      "risk_category": "<category of risk>",
      "description": "<description of the risk>",
      "likelihood": "<high|medium|low>",
      "impact": "<critical|high|medium|low>",
      "mitigation_strategy": "<how to mitigate this risk>"
    }
  ],
  "implementation_checklist": [
    {
      "phase": "<implementation phase, e.g., Phase 1: Foundation, Phase 2: Quality, Phase 3: Governance, Phase 4: AI Integration>",
      "task": "<specific task description>",
      "completed": false,
      "notes": "<relevant notes or context for this task>"
    }
  ],
  "key_recommendations": ["<recommendation 1>", "<recommendation 2>"],
  "estimated_time_to_readiness": "<overall estimated time to achieve AI readiness, e.g., 3-6 months>"
}

Ensure you provide:
- At least 6 data quality dimension scores
- At least 4 compliance gaps (based on the stated requirements)
- At least 8 governance framework items
- At least 8 remediation steps in prioritized order
- At least 5 risk items
- At least 12 implementation checklist items across at least 3 phases
- At least 5 key recommendations

Be specific, actionable, and realistic in all assessments. Tailor everything to the organization's stated domain, team size, data volume, and current governance maturity level. Do not be generic—reference the specific data sources and context provided.`;

  const userPrompt = `Please perform a comprehensive AI Readiness Audit based on the following enterprise data profile:

## Data Sources Description
${sanitizedInput.data_sources_description}

## Current Governance Level
${sanitizedInput.current_governance_level}

## Compliance Requirements
${sanitizedInput.compliance_requirements}

## AI/ML Use Case Domain
${sanitizedInput.use_case_domain}

## Team Size
${sanitizedInput.team_size}

## Estimated Data Volume
${sanitizedInput.data_volume_estimate}

Please generate a thorough AI readiness audit report with data quality scores, compliance gap analysis, a governance framework template, a prioritized remediation roadmap, risk assessment, and a complete implementation checklist. Respond with valid JSON only.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.4,
    max_tokens: 8000,
    response_format: { type: "json_object" },
  });

  const tokens = response.usage?.total_tokens || 0;
  const cost = tokens * 0.000005;

  const content = response.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("No response content received from OpenAI.");
  }

  let parsed: AiReadinessAuditorResponse;
  try {
    parsed = JSON.parse(content) as AiReadinessAuditorResponse;
  } catch (parseError) {
    throw new Error("Failed to parse AI response as valid JSON. Please try again.");
  }

  if (typeof parsed.executive_summary !== "string" || parsed.executive_summary.length === 0) {
    throw new Error("Invalid response: missing executive_summary.");
  }
  if (typeof parsed.overall_readiness_score !== "number" || parsed.overall_readiness_score < 0 || parsed.overall_readiness_score > 100) {
    throw new Error("Invalid response: overall_readiness_score must be a number between 0 and 100.");
  }
  if (!Array.isArray(parsed.data_quality_scores) || parsed.data_quality_scores.length === 0) {
    throw new Error("Invalid response: missing or empty data_quality_scores.");
  }
  if (!Array.isArray(parsed.compliance_gap_analysis) || parsed.compliance_gap_analysis.length === 0) {
    throw new Error("Invalid response: missing or empty compliance_gap_analysis.");
  }
  if (!Array.isArray(parsed.governance_framework_template) || parsed.governance_framework_template.length === 0) {
    throw new Error("Invalid response: missing or empty governance_framework_template.");
  }
  if (!Array.isArray(parsed.remediation_roadmap) || parsed.remediation_roadmap.length === 0) {
    throw new Error("Invalid response: missing or empty remediation_roadmap.");
  }
  if (!Array.isArray(parsed.risk_assessment) || parsed.risk_assessment.length === 0) {
    throw new Error("Invalid response: missing or empty risk_assessment.");
  }
  if (!Array.isArray(parsed.implementation_checklist) || parsed.implementation_checklist.length === 0) {
    throw new Error("Invalid response: missing or empty implementation_checklist.");
  }
  if (!Array.isArray(parsed.key_recommendations) || parsed.key_recommendations.length === 0) {
    throw new Error("Invalid response: missing or empty key_recommendations.");
  }
  if (typeof parsed.estimated_time_to_readiness !== "string" || parsed.estimated_time_to_readiness.length === 0) {
    throw new Error("Invalid response: missing estimated_time_to_readiness.");
  }

  return { result: parsed, tokens, cost };
}
