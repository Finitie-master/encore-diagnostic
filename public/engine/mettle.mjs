// The Encore Score: Mettle. Scoring engine (runs in the browser and in tests).
// Tests the person rather than the idea: aptitude (how you're wired), ability (what you can do)
// and tenacity (what keeps you going), then compares five routes to an encore, not just going solo.

export const NAME = "Mettle";
export const FULL_NAME = "The Encore Score: Mettle";

// Seven dimensions in three pillars.
export const DIMS = {
  SD: { name: "Self-direction", pillar: "A",
    strong: "You set your own agenda and stick to it. Nobody needs to wind you up in the morning.",
    weak: "You do your best work with structure and people around you. Going solo means building that structure yourself, or choosing a route that comes with some." },
  UN: { name: "Comfort with uncertainty", pillar: "A",
    strong: "You can live with not knowing how the month will end, which is most of what working for yourself feels like at the start.",
    weak: "Uncertainty costs you sleep. That isn't a flaw, but it should shape how fast you jump and what you keep as a safety net." },
  SE: { name: "Selling yourself", pillar: "B",
    strong: "You can talk about your work and ask for money without wincing. Most senior people find this the hardest part.",
    weak: "Asking for money and talking about yourself don't come easily. Every solo business runs on both, so this needs practice or a partner." },
  CR: { name: "Commercial range", pillar: "B",
    strong: "You'll roll your sleeves up for the admin, the tech and the tools a team used to handle for you.",
    weak: "The back office a team used to run will land on your desk. Plan for it with AI, simple systems or a bit of paid help." },
  RC: { name: "Reach", pillar: "B",
    strong: "People know you and come to you. Your first clients are probably already in your contacts.",
    weak: "Your network is quieter than your expertise deserves. First clients usually come from people who know your work, so this is where to start." },
  RE: { name: "Bounce-back", pillar: "T",
    strong: "A 'no' doesn't keep you down for long. You'll hear plenty of them, and you'll be fine.",
    weak: "Rejection lingers. After an 'overqualified' or two that's understandable, and it's the thing most worth working on before you start pitching." },
  ST: { name: "Staying power", pillar: "T",
    strong: "You've stuck at hard things before, and the people around you would back you through a slow start.",
    weak: "The long middle is where solo businesses quietly stop. You'll need support, structure or a plan for month seven." },
};

export const PILLARS = {
  A: { name: "Aptitude", sub: "How you're wired", dims: ["SD", "UN"], w: 0.3,
    note: "The hardest part to change, so it should shape the route you choose." },
  B: { name: "Ability", sub: "What you can do", dims: ["SE", "CR", "RC"], w: 0.35,
    note: "The most learnable part, and the part The Encore Programme builds." },
  T: { name: "Tenacity", sub: "What keeps you going", dims: ["RE", "ST"], w: 0.35,
    note: "It grows with support, structure and a few early wins." },
};

export const SCALE = [["Not at all", ""], ["Slightly", ""], ["Partly", ""], ["Mostly", ""], ["Completely", "I could give you examples"]];

export const STAGES = [
  "Still employed, thinking about what's next",
  "Recently left or made redundant",
  "Between roles for a while",
  "Already working for myself, early days",
  "Running my own thing, and wondering if it's the right shape",
];

// Route keys: solo, fractional, partner, interim, hybrid
// type "rate": 0-4 statement. rev: reverse-scored. type "choice": options with dimension scores (s) and route signals (r).
export const Q = [
  { id: "stage", type: "choice", eyebrow: "Where you are", title: "Where are you right now?",
    help: "This doesn't change your score. It helps the result make sense for your situation.",
    opts: STAGES.map((t) => ({ t })) },

  { id: "s1", type: "rate", dim: "SD", eyebrow: "Aptitude", title: "I do my best work when nobody else is setting my priorities." },
  { id: "sc1", type: "choice", eyebrow: "Aptitude", title: "It's Monday, 9am, and the diary is empty. Nobody is expecting anything from you. Your honest first reaction?",
    opts: [
      { t: "Bliss. I know exactly what I'd do with it.", s: { SD: 4, UN: 4 }, r: { solo: 2 } },
      { t: "I'd be on the phone by ten, finding the work.", s: { SD: 3, UN: 3 }, r: { solo: 1, fractional: 1 } },
      { t: "Fine for a day. By Wednesday I'd want some structure.", s: { SD: 1, UN: 2 }, r: { partner: 2, interim: 1 } },
      { t: "Mild panic. I'd be checking job sites by lunchtime.", s: { SD: 0, UN: 0 }, r: { hybrid: 2, interim: 1 } },
    ] },
  { id: "s2", type: "rate", dim: "SD", rev: true, eyebrow: "Aptitude", title: "Without a boss, a team and a deadline, I'd find it hard to get going." },
  { id: "s3", type: "rate", dim: "UN", eyebrow: "Aptitude", title: "I could live with income that's good some months and thin in others while a business finds its feet." },
  { id: "s4", type: "rate", dim: "UN", rev: true, eyebrow: "Aptitude", title: "I need to know how something will turn out before I commit to it." },

  { id: "s5", type: "rate", dim: "SE", eyebrow: "Ability", title: "I'm comfortable asking for money for my work and saying the price out loud." },
  { id: "sc2", type: "choice", eyebrow: "Ability", title: "A potential client likes your proposal but says the price is too high. What do you do?",
    opts: [
      { t: "Hold the price and walk them back through what it gets them.", s: { SE: 4, CR: 3 } },
      { t: "Offer a smaller piece of work for less.", s: { SE: 3, CR: 4 } },
      { t: "Knock some off. Winning the first one matters most.", s: { SE: 1, CR: 1 } },
      { t: "Feel awkward, say I'll think about it, and hope they come back.", s: { SE: 0, CR: 0 } },
    ] },
  { id: "s6", type: "rate", dim: "SE", eyebrow: "Ability", title: "I'd be happy to talk about what I do in public, in posts, talks and introductions." },
  { id: "s7", type: "rate", dim: "CR", eyebrow: "Ability", title: "I'll happily do the jobs a team used to do for me, including the invoices, the admin and the tech." },
  { id: "s8", type: "rate", dim: "CR", eyebrow: "Ability", title: "I'm willing to try AI and new tools to get work done faster, learning as I go." },
  { id: "s9", type: "rate", dim: "RC", eyebrow: "Ability", title: "I could name 20 people who would take my call this week." },
  { id: "s10", type: "rate", dim: "RC", eyebrow: "Ability", title: "People already come to me for advice without being asked." },

  { id: "sc3", type: "choice", eyebrow: "Your encore", title: "Picture a good working week two years from now. Which sounds most like it?",
    help: "There's no right answer here. This one shapes your routes, not your score.",
    opts: [
      { t: "My own clients, my own way, every day of the week.", r: { solo: 4 } },
      { t: "Two or three organisations, a couple of days each, as part of their team.", r: { fractional: 4 } },
      { t: "Building something with one or two people I trust.", r: { partner: 4 } },
      { t: "One meaty contract with a clear brief and an end date.", r: { interim: 4 } },
      { t: "A steady income, with something of my own growing alongside it.", r: { hybrid: 4 } },
    ] },

  { id: "s11", type: "rate", dim: "RE", eyebrow: "Tenacity", title: "When something I've worked on is turned down, I'm back at it within a day or two." },
  { id: "s12", type: "rate", dim: "RE", rev: true, eyebrow: "Tenacity", title: "A 'no' or a 'not now' stays with me for a long time." },
  { id: "sc4", type: "choice", eyebrow: "Tenacity", title: "Three months in. Two paying clients and plenty of 'really interesting, let's stay in touch'. What happens next?",
    opts: [
      { t: "I change who I'm asking or what I'm offering, and go again.", s: { RE: 4, ST: 4 } },
      { t: "I keep going exactly as I am. It'll come.", s: { RE: 3, ST: 3 } },
      { t: "I start wondering whether this was a terrible idea.", s: { RE: 1, ST: 2 } },
      { t: "I quietly start applying for jobs.", s: { RE: 0, ST: 0 }, r: { hybrid: 2 } },
    ] },
  { id: "s13", type: "rate", dim: "ST", eyebrow: "Tenacity", title: "I've stuck at something hard for a year or more before it paid off." },
  { id: "s14", type: "rate", dim: "ST", eyebrow: "Tenacity", title: "The people closest to me would back me through a slow first year." },

  { id: "sc5", type: "choice", eyebrow: "Your encore", title: "What matters most to you about the next ten years of work?",
    help: "Pick the one you'd keep if you could only keep one.",
    opts: [
      { t: "Control over my own time.", r: { solo: 2, hybrid: 1 } },
      { t: "Building something that's mine.", r: { solo: 2, partner: 1 } },
      { t: "Interesting problems that use what I know.", r: { fractional: 2, interim: 1 } },
      { t: "Income I can rely on.", r: { hybrid: 2, interim: 2 } },
      { t: "Working alongside good people.", r: { partner: 2, fractional: 1 } },
    ] },
];

export const ROUTES = {
  solo: { name: "Your own business",
    what: "Clients of your own, your offer, your price and your name on the door.",
    test: "Sell one small, paid piece of work to someone outside your old employer before you build anything else.",
    w: { SD: .2, UN: .15, SE: .2, CR: .1, RC: .1, RE: .15, ST: .1 } },
  fractional: { name: "Fractional or portfolio work",
    what: "A few days a month each with two or three organisations, doing senior work you already know well.",
    test: "Ask three founders or managing directors what two days a month of your expertise would be worth to them.",
    w: { RC: .3, SE: .15, SD: .15, RE: .15, ST: .15, CR: .1 } },
  partner: { name: "Partnering up",
    what: "Going it together, with a co-founder, an associate network or a small collective that shares the selling and the load.",
    test: "Name two people whose strengths cover your gaps, and have a coffee about doing one piece of work together.",
    w: { RE: .2, ST: .2, RC: .2, SE: .1, CR: .1, "-SD": .2 } },
  interim: { name: "Interim or contract work",
    what: "Defined assignments with a clear brief and an end date, often found through specialist agencies.",
    test: "Speak to two interim agencies in your field and ask what's in demand right now, and at what day rate.",
    w: { RC: .3, "-UN": .25, RE: .15, CR: .1, SD: .1, ST: .1 } },
  hybrid: { name: "A salary plus something of your own",
    what: "Part-time or contract income that covers the bills while you test a business alongside it.",
    test: "Block one morning a week for the business for the next six weeks, and notice whether you protect it.",
    w: { "-UN": .3, SD: .15, CR: .15, RE: .15, ST: .15, SE: .1 } },
};

export const CHALLENGE = {
  SD: "Who decides what you do on a Tuesday afternoon when nobody is waiting for anything?",
  UN: "How much not-knowing could you live with, and for how long, before it starts making your decisions for you?",
  SE: "If you won't say your price out loud, who exactly is going to say it for you?",
  CR: "Which jobs would you happily do yourself, which would you hand to AI, and which would you pay someone to take away?",
  RC: "Who are the first ten people who should hear about this, and have you told any of them yet?",
  RE: "What story do you tell yourself after a 'no', and would it stand up in court?",
  ST: "What will keep you going in month seven, when it's slow and nobody is clapping?",
};

// Pairs where the answers can contradict each other. [positive item, reversed item, note]
const CHECKS = [
  ["s1", "s2", "You said you do your best work when nobody sets your priorities, and also that you'd struggle without a boss and a deadline. Both can be true. Find out which one turns up on a slow Tuesday before you build a business on the first."],
  ["s3", "s4", "You said you could live with lumpy income, and also that you need to know how things will turn out before committing. One of those is probably the brave answer and the other the true one."],
  ["s11", "s12", "You said you bounce back within a day or two, and also that a 'no' stays with you for a long time. Most people who've been knocked back recently would say both, and the second one is the one to plan for."],
];

export const PROFILES = {
  natural: { name: "The Natural Soloist",
    text: [
      "Your answers describe someone wired for this. You set your own direction, you can ride out the wobbly months, you'll ask for money without apologising and a 'no' doesn't stop you for long.",
      "The risk for people like you is rarely ability. It's momentum pointed the wrong way. When you're good at getting going, it's very tempting to build the website, the brand and the five-part offer before anyone has paid you a penny.",
      "So aim all that energy at evidence. Your next job is to find out which version of your expertise people will actually pay for, and that's exactly what the Encore Score: Idea tests.",
    ],
    action: "Pick the one offer you'd sell tomorrow if someone asked. Tell five people in your network about it this week and ask who they know who needs it." },
  allrounder: { name: "The Steady All-Rounder",
    text: [
      "No alarm bells and no fireworks. You've got a sensible spread across how you're wired, what you can do and what keeps you going.",
      "That's a good place to start from. It also means there's no single strength carrying you yet, and solo businesses tend to run on one or two things the founder is unusually good at, whether that's selling, a big network or sheer stubbornness.",
      "Build your approach around your strongest area below, and put a plan in place for your weakest before it catches you out in month four.",
    ],
    action: "Write down the one thing people would say you're unusually good at. Design your first offer so that thing does most of the work." },
  seller: { name: "The Reluctant Seller",
    text: [
      "You've got the temperament and the staying power. What's missing is the part almost every senior professional dreads: asking for money and talking about yourself in public.",
      "In a big organisation other people did the selling, and your job title did the introductions. On your own, nobody is going to stumble across you, however good you are. Brilliant people lose work every week to someone half as good who's comfortable saying \"I can help with that, and here's what it costs.\"",
      "The good news is that selling as an expert looks nothing like a sales job. It's mostly useful conversations with people who already have the problem. You can learn it, and it gets noticeably easier from the second conversation.",
    ],
    action: "Write your price down. Say it out loud, to the mirror if necessary, then to one real person this week without apologising or offering a discount." },
  secret: { name: "The Best-Kept Secret",
    text: [
      "You've got the expertise and the temperament. The trouble is that not enough people know about it.",
      "When you leave a big role, a lot of your visibility stays behind with the employer. The calls, the invitations and the \"could you just look at this\" often belonged to the job title. Your first clients will almost certainly come from people who already know your work, so a quiet network is the main thing standing between you and paid work.",
      "That's fixable, and quicker than most people expect. There's usually far more goodwill in your contacts than you've ever used. Use it before you spend a penny on marketing.",
    ],
    action: "Write a list of 50 people who know your work. Get back in touch with five of them this week, with no pitch, just to ask what they're working on." },
  backoffice: { name: "The Expert Who Needs a Back Office",
    text: [
      "You're wired for working on your own and you'll keep going when it's hard. What gives you pause is everything a team used to handle: the invoices, the tech, the tools and the admin that never quite ends.",
      "That matters more than it sounds. Capable people stall in their first year because the business side eats the hours they meant to spend on clients.",
      "It's now the easiest gap to close. Simple systems, a little paid help and AI used properly can take most of the drudge off your desk. Your experience is what makes AI useful in the first place, because you can tell when it's confidently wrong.",
    ],
    action: "List every job your old team or support staff did for you. Mark each one 'do it myself', 'automate it' or 'pay someone'. Sort out the first 'automate it' this week." },
  sprinter: { name: "The Sprinter",
    text: [
      "You've got plenty going for you. You can direct yourself, sell what you do and roll your sleeves up. What your answers question is the long middle.",
      "Most solo businesses don't fail in the first month. They fade in month six or seven, when the excitement has worn off, the warm contacts have all been asked and the results are lumpy. Without support or structure around you, that's the point people quietly go back to a job.",
      "So plan for month seven before you start. Decide now who you'll check in with, what you'll measure and what keeping going looks like in a slow month.",
    ],
    action: "Name one person who'll ask you every fortnight what you've done for the business. Book the first conversation now." },
  repair: { name: "Confidence Under Repair",
    text: [
      "Your answers suggest real ability. They also suggest that rejection lands hard at the moment, and stays with you.",
      "If you've had a run of \"overqualified\", \"not quite the right fit\" or silence after an application, that's hardly surprising. Keep two things separate, though. Being turned down by employers tells you very little about whether buyers will pay for what you know. They're different people asking different questions.",
      "Before you start pitching, learn to catch the story your mind tells you after a 'no'. \"I'm too old\" and \"nobody wants me\" feel like facts and usually aren't. Confidence tends to come back fastest through small early wins with people who already rate you.",
    ],
    action: "Ask three people who've worked with you what they'd come to you for. Write their exact words down and keep them somewhere you'll see them." },
  planner: { name: "The Careful Planner",
    text: [
      "You've clearly got the ability to do this. What your answers show is a strong preference for knowing how things will turn out before you commit.",
      "That instinct has probably served you very well in senior roles. Working for yourself, especially at the start, runs on not knowing: which client says yes, which month is good, which idea lands. If that much uncertainty would keep you awake, jumping straight in is a hard way to find out.",
      "There are gentler ways in. A part-time contract or interim role can cover the bills while you test a business on the side, and you can shift the balance once the evidence is in. Look at your routes below before you decide.",
    ],
    action: "Work out the smallest version of your business you could test in six weeks without giving anything up. Start it this month." },
  team: { name: "The Team Player",
    text: [
      "You do your best work with people around you and some structure to push against. That's a real strength, and it's also a signal worth listening to.",
      "Going fully solo takes both away. Some people love the quiet. Others find, about three weeks in, that they've started discussing strategy with the kettle. If you suspect you're in the second group, forcing it probably isn't the answer.",
      "Fractional roles, associate networks and partnering with one or two people you trust all give you independence without the solitude. Your routes below show which suits you best.",
    ],
    action: "Name two people you'd genuinely like to work alongside. Ask each of them what they're working on next and whether there's something you could do together." },
  beginner: { name: "The Brave Beginner",
    text: [
      "You've got the parts that are hardest to teach. You set your own direction, you can live with uncertainty and you keep going when it's slow.",
      "What you don't have yet are some of the practical skills: selling, the business admin and a network that knows what you do now. Those gaps feel bigger than they are because they're the most visible.",
      "They're also the most learnable. Nobody is born knowing how to price a piece of work or write a proposal. People with your temperament tend to pick it up quickly once they have a method and someone in their corner.",
    ],
    action: "Pick your weakest skill below and find one person who's good at it. Buy them a coffee and ask how they learned." },
  notyet: { name: "Not This Route, Yet",
    text: [
      "Honest answer: going it alone doesn't look like the right shape for you right now. Better to know that today than a year and a lot of energy from now, and it says nothing about the value of your expertise.",
      "Several things are pulling against a solo business at once. Pushing on regardless is how people end up twelve months in, tired and out of pocket.",
      "Your encore doesn't have to be solo. Interim or fractional work, a partnership, or a salary with something of your own growing alongside it may suit you far better. Look at the routes below, and come back to this score in six months if things change.",
    ],
    action: "Pick the route below that fits you best and have one conversation this week with someone who's already doing it." },
};

export const BANDS = [["Not this route yet", 0, 24], ["Stretch zone", 25, 44], ["In the making", 45, 64], ["Ready, with backup", 65, 79], ["Built for it", 80, 100]];
export const band = (n) => BANDS.find((b) => n >= b[1] && n <= b[2])[0];

const avg = (a) => Math.round(a.reduce((t, x) => t + x, 0) / a.length);

// ans: { [questionId]: number } (rate: 0-4, choice: option index)
export function score(ans) {
  const sums = {}, counts = {};
  Object.keys(DIMS).forEach((k) => { sums[k] = 0; counts[k] = 0; });
  const routeBoost = { solo: 0, fractional: 0, partner: 0, interim: 0, hybrid: 0 };
  for (const q of Q) {
    const v = ans[q.id];
    if (q.type === "rate") {
      const val = v ?? 0;
      sums[q.dim] += q.rev ? 4 - val : val;
      counts[q.dim] += 1;
    } else if (q.id !== "stage") {
      const o = v === undefined ? null : q.opts[v];
      // every scored scenario counts towards its dimensions even if unanswered (as 0)
      const dimsTouched = new Set(q.opts.flatMap((x) => Object.keys(x.s || {})));
      dimsTouched.forEach((k) => { sums[k] += (o && o.s && o.s[k]) || 0; counts[k] += 1; });
      if (o && o.r) Object.entries(o.r).forEach(([k, n]) => { routeBoost[k] += n; });
    }
  }
  const d = {};
  Object.keys(DIMS).forEach((k) => { d[k] = Math.round((sums[k] / (counts[k] * 4)) * 100); });
  const p = {};
  Object.entries(PILLARS).forEach(([k, P]) => { p[k] = avg(P.dims.map((x) => d[x])); });
  const overall = Math.round(Object.entries(PILLARS).reduce((t, [k, P]) => t + p[k] * P.w, 0));

  const routes = Object.entries(ROUTES).map(([k, R]) => {
    let base = 0;
    Object.entries(R.w).forEach(([dk, w]) => { base += (dk[0] === "-" ? 100 - d[dk.slice(1)] : d[dk]) * w; });
    const fit = Math.max(0, Math.min(99, Math.round(base * 0.8 + routeBoost[k] * 4)));
    return { key: k, fit };
  }).sort((a, b) => b.fit - a.fit);

  return { d, p, overall, routes };
}

export function profile({ d, p, overall }) {
  const all = Object.values(d);
  if (overall < 35) return "notyet";
  if (d.SD < 40) return "team";
  if (d.UN < 40 && p.B >= 50) return "planner";
  if (d.RE < 40) return "repair";
  if (p.B < 50 && p.A >= 60 && p.T >= 60) return "beginner";
  if (d.SE < 50) return "seller";
  if (d.RC < 45) return "secret";
  if (d.CR < 45) return "backoffice";
  if (d.ST < 45) return "sprinter";
  if (all.every((x) => x >= 70)) return "natural";
  return "allrounder";
}

// Which dimension each profile is really about (its constraint), if any.
const PROFILE_CON = { team: "SD", planner: "UN", repair: "RE", seller: "SE", secret: "RC", backoffice: "CR", sprinter: "ST" };

const order = (d, dir) => Object.keys(DIMS).sort((a, b) => dir * (d[b] - d[a]) || a.localeCompare(b));

export function outcome(ans) {
  const s = score(ans);
  const pk = profile(s);
  const strongest = order(s.d, 1)[0];
  let constraint = PROFILE_CON[pk] || order(s.d, -1)[0];
  if (constraint === strongest) constraint = order(s.d, -1).find((k) => k !== strongest);
  const lowest = order(s.d, -1);
  const challenges = [constraint, ...lowest.filter((k) => k !== constraint)].slice(0, 2).map((k) => ({ dim: k, q: CHALLENGE[k] }));
  const flags = CHECKS.filter(([a, b]) => ans[a] !== undefined && ans[b] !== undefined && Math.abs(ans[a] - (4 - ans[b])) >= 3).map((c) => c[2]);
  if (ans.sc4 === 1) flags.push("You said that three months in you'd keep going exactly as you are. Persistence matters, but doing the same thing for longer rarely changes the answer. Change one thing, then test again.");
  return { ...s, pk, strongest, constraint, challenges, flags, band: band(s.overall) };
}

// Preview personas, all called David to match the Idea Score samples.
export const SAMPLES = {
  A: { label: "Natural", stage: 1, a: { s1: 4, sc1: 0, s2: 0, s3: 3, s4: 1, s5: 4, sc2: 0, s6: 3, s7: 3, s8: 4, s9: 4, s10: 4, sc3: 0, s11: 4, s12: 1, sc4: 0, s13: 4, s14: 3, sc5: 1 } },
  B: { label: "Reluctant seller", stage: 1, a: { s1: 3, sc1: 1, s2: 1, s3: 3, s4: 2, s5: 1, sc2: 2, s6: 1, s7: 3, s8: 3, s9: 3, s10: 4, sc3: 1, s11: 3, s12: 1, sc4: 0, s13: 4, s14: 3, sc5: 2 } },
  C: { label: "Team player", stage: 0, a: { s1: 1, sc1: 2, s2: 3, s3: 2, s4: 2, s5: 2, sc2: 1, s6: 3, s7: 2, s8: 3, s9: 4, s10: 3, sc3: 2, s11: 3, s12: 2, sc4: 0, s13: 3, s14: 3, sc5: 4 } },
  D: { label: "Careful planner", stage: 2, a: { s1: 3, sc1: 3, s2: 2, s3: 0, s4: 4, s5: 3, sc2: 1, s6: 2, s7: 3, s8: 3, s9: 3, s10: 3, sc3: 4, s11: 2, s12: 2, sc4: 2, s13: 3, s14: 2, sc5: 3 } },
  E: { label: "Confidence knocked", stage: 2, a: { s1: 3, sc1: 1, s2: 1, s3: 2, s4: 2, s5: 2, sc2: 1, s6: 2, s7: 3, s8: 3, s9: 2, s10: 3, sc3: 0, s11: 1, s12: 4, sc4: 2, s13: 3, s14: 3, sc5: 0 } },
};
export const SAMPLE_EXPECT = { A: "natural", B: "seller", C: "team", D: "planner", E: "repair" };
