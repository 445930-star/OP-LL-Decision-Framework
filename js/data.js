/* ==========================================================================
   OP Learning Lead — programme customisation tool
   Data — six needs criteria, mapped one-to-one onto the sixteen tasks from
   the OP Learning Lead Calculator (.xlsx, 06/11/2025). Every task sits under
   exactly one criterion; hours sum to the calculator's 41-hour Full
   Engagement baseline with none left over. This mapping reflects a working
   agreement between Ali and the OP SPM, not a published GIBS document —
   flagged as such in the tool's "where this comes from" note.

   Flagship programme carries no tasks and no hours of its own: agreed as a
   qualitative reason to execute the other selected needs more rigorously,
   not a separate activity.
   ========================================================================== */

const OP_CRITERIA = [
  { id: 'relevance', title: 'Programme relevance', desc: 'The programme needs to stay current with emerging leadership thinking, market expectations, and evolving participant needs.' },
  { id: 'refresh', title: 'Programme refresh or reconstruction', desc: 'The programme is dated, lacks clear aims or design rationale, or needs to be repositioned or re-architected.' },
  { id: 'differentiation', title: 'Portfolio differentiation', desc: 'The programme needs a clear identity and level within the OP portfolio, with unnecessary duplication across programmes avoided.' },
  { id: 'coherence', title: 'Programme coherence', desc: 'The programme involves multiple faculty, coaches, integrators, providers, or learning experiences that need to function as one connected learning journey.' },
  { id: 'quality', title: 'End-to-end learning quality', desc: 'The programme requires a single learning expert to hold responsibility for aims, architecture, integration, coherence, continuous improvement, and reporting on programme effectiveness.' },
  { id: 'flagship', title: 'Flagship programme', desc: 'The programme is one of OP\u2019s flagship offerings where protecting quality, distinctiveness, reputation, and ongoing evolution is especially important.', noHours: true },
];

const OP_FULL_BASELINE = 41;

const OP_RESP_CATS = {
  'Market & Programme Alignment':             { bg: 'var(--faculty-bg)',   color: 'var(--faculty-text)',   bar: '#D85A30' },
  'Programme Design Translation & Alignment': { bg: 'var(--design-bg)',    color: 'var(--design-text)',    bar: '#7F77DD' },
  'Learning Experience & Cohesion Leadership':{ bg: 'var(--coherence-bg)', color: 'var(--coherence-text)', bar: '#1D9E75' },
  'Evaluation & Continuous Improvement':      { bg: 'var(--evaluate-bg)',  color: 'var(--evaluate-text)',  bar: '#378ADD' },
  'Collaboration & Stakeholder Engagement':   { bg: 'var(--client-bg)',    color: 'var(--client-text)',    bar: '#BA7517' },
};

// Bar/chip colour per criterion, for the criterion-grouped view in tab 3.
// No entry for 'flagship' — it never appears in the table or bars, it has
// no tasks.
const OP_CRIT_COLORS = {
  relevance:       { bg: 'var(--faculty-bg)',   color: 'var(--faculty-text)',   bar: '#D85A30' },
  refresh:         { bg: 'var(--design-bg)',    color: 'var(--design-text)',    bar: '#7F77DD' },
  differentiation: { bg: 'var(--client-bg)',    color: 'var(--client-text)',    bar: '#BA7517' },
  coherence:       { bg: 'var(--coherence-bg)', color: 'var(--coherence-text)', bar: '#1D9E75' },
  quality:         { bg: 'var(--evaluate-bg)',  color: 'var(--evaluate-text)',  bar: '#378ADD' },
};

// 16 tasks, Full Engagement hours only (the Refresh/Light Touch percentage
// tiers from the source calculator are not used in this tool — hours here
// come from which needs are ticked, not from a scenario percentage).
// `criterion` is the OP_CRITERIA id each task was agreed to sit under.
const OP_TASKS = [
  { id:9,  resp:'Market & Programme Alignment', task:'Conduct market scan and leadership trends review', cpTask:'Understand the client\u2019s context and learning needs', note:'Ensure relevance to current leadership development topics (e.g. sustainability). Not full market research \u2014 if that\u2019s required, the PM pays for it separately; otherwise the Learning Lead works from trends/insights already given to them.', full:3, criterion:'relevance' },
  { id:14, resp:'Programme Design Translation & Alignment', task:'Identify new or updated modules/themes', cpTask:null, note:'Add emerging themes to maintain topical relevance.', full:1, criterion:'relevance' },

  { id:11, resp:'Market & Programme Alignment', task:'Reconstruct programme rationale, aims, objectives, and outcomes', cpTask:'Translate design & needs into aims, objectives, outcomes', note:'Retrofit missing design intent through desk review and faculty input; create detailed aims and map outcomes across the programme.', full:3, criterion:'refresh' },
  { id:13, resp:'Programme Design Translation & Alignment', task:'Review and update learning architecture and outline', cpTask:'Develop high-level learning architecture & outline', note:'Ensure logical progression and integration of content; map verticals/horizontals.', full:3, criterion:'refresh' },
  { id:16, resp:'Programme Design Translation & Alignment', task:'Recommend faculty in collaboration with PM', cpTask:'Faculty & provider selection (with PM)', note:'Targeted matching of experts to programme needs, in support of differentiation and market appeal.', full:2, criterion:'refresh' },

  { id:10, resp:'Market & Programme Alignment', task:'Understand OP portfolio for differentiation and progression', cpTask:'Participate in client meetings & design discussions', note:'Avoid overlap and ensure progression between programmes (e.g. GMP \u2192 GEDP).', full:2, criterion:'differentiation' },
  { id:12, resp:'Market & Programme Alignment', task:'Collaborate with CE Head/SPM for alignment and marketing', cpTask:null, note:'Ensure coherence between learning design and market positioning (review website and brochure, recommend updates).', full:3, criterion:'differentiation' },

  { id:17, resp:'Programme Design Translation & Alignment', task:'Conduct faculty briefing and alignment sessions', cpTask:'Faculty briefing & alignment sessions', note:'Multiple faculty sessions ensuring alignment and coherence, focused on aims, outcomes, and positioning.', full:3, criterion:'coherence' },
  { id:18, resp:'Programme Design Translation & Alignment', task:'Review faculty course outlines & architectures', cpTask:'Review faculty course outlines & architectures', note:'Detailed feedback and integration loops.', full:3, criterion:'coherence' },
  { id:24, resp:'Collaboration & Stakeholder Engagement', task:'Work with OP Head/SPM, faculty, coaches for updates', cpTask:'Work with CE heads, PMs, faculty, coaches', note:'Proactive collaboration across stakeholders.', full:3, criterion:'coherence' },

  { id:19, resp:'Learning Experience & Cohesion Leadership', task:'Champion learning quality & ensure standards', cpTask:'Champion learning quality & ensure standards + Serve as programme expert & advisor on learning theory', note:'Serve as programme expert & advisor on learning theory, with continuous oversight.', full:3, criterion:'quality' },
  { id:20, resp:'Learning Experience & Cohesion Leadership', task:'Monitor programme delivery alignment & feedback loops', cpTask:'Monitor programme delivery alignment & feedback loops + Provide guidance & support to faculty during programme', note:'Active monitoring, with guidance & support provided to faculty during the programme (data sources: Integrator, PM, Leads, faculty).', full:3, criterion:'quality' },
  { id:15, resp:'Evaluation & Continuous Improvement', task:'Develop evaluation and impact metrics', cpTask:'Develop learning impact evaluation frameworks', note:'Create an evaluation framework to demonstrate programme value.', full:3, criterion:'quality' },
  { id:21, resp:'Evaluation & Continuous Improvement', task:'Evaluate programme effectiveness & faculty contributions', cpTask:'Evaluate programme effectiveness & faculty contributions', note:'Triangulated data sources & holistic analysis (set up data sources and requirements with relevant stakeholders \u2014 Integrator, PM, Leads, etc).', full:2, criterion:'quality' },
  { id:22, resp:'Evaluation & Continuous Improvement', task:'Analyse participant feedback and outcomes data', cpTask:'Curate & interpret feedback from all leads', note:'Synthesise survey and outcome data.', full:2, criterion:'quality' },
  { id:23, resp:'Evaluation & Continuous Improvement', task:'Produce short impact summary report', cpTask:'Produce post-programme impact reports', note:'Summarise insights for the OP Head/SPM and faculty, and provide recommendations for enhancement.', full:2, criterion:'quality' },
];

// Informational only — GIBS flagged that this doesn't hold up cleanly
// enough in practice to build into a working calculator, so it's shown as
// guidance text rather than a scenario with its own numbers.
const OP_PORTFOLIO_NOTE = 'If the same Learning Lead continues across multiple Open Programmes, two adjustments have been discussed: reducing repeated market-scan time by reusing insight across programmes, and adding roughly 3\u20134 hours per quarter for cross-programme synthesis to identify systemic learning trends. This hasn\u2019t been built into a working model \u2014 GIBS found it doesn\u2019t hold up cleanly enough in practice \u2014 so treat it as a discussion point with PAL, not a number to quote.';
