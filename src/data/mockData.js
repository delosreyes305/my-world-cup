// ─── MY WORLD CUP 2026 — Mock Data ───────────────────
// Replace fetch calls with real API endpoints when ready

export const MATCHES = [
  { id: 1,  team1: 'Argentina', flag1: '🇦🇷', team2: 'France',      flag2: '🇫🇷', score1: 2, score2: 1, status: 'live',     time: "73'", group: 'QF', venue: 'AT&T Stadium',    stadium: 'Dallas' },
  { id: 2,  team1: 'Germany',   flag1: '🇩🇪', team2: 'Spain',        flag2: '🇪🇸', score1: 0, score2: 1, status: 'live',     time: "62'", group: 'SF', venue: 'SoFi Stadium',    stadium: 'Los Angeles' },
  { id: 3,  team1: 'Morocco',   flag1: '🇲🇦', team2: 'Portugal',     flag2: '🇵🇹', score1: 1, score2: 0, status: 'live',     time: "44'", group: 'QF', venue: 'Gillette Stadium', stadium: 'Boston' },
  { id: 4,  team1: 'Japan',     flag1: '🇯🇵', team2: 'Belgium',      flag2: '🇧🇪', score1: 3, score2: 2, status: 'ft',       time: 'FT',  group: 'R16',venue: 'Estadio Azteca',  stadium: 'Mexico City' },
  { id: 5,  team1: 'Brazil',    flag1: '🇧🇷', team2: 'Netherlands',  flag2: '🇳🇱', score1: null, score2: null, status: 'upcoming', time: '18:00', group: 'SF', venue: 'MetLife Stadium', stadium: 'New York' },
  { id: 6,  team1: 'England',   flag1: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', team2: 'USA',     flag2: '🇺🇸', score1: null, score2: null, status: 'upcoming', time: '21:00', group: 'QF', venue: 'Lumen Field',     stadium: 'Seattle' },
  { id: 7,  team1: 'Mexico',    flag1: '🇲🇽', team2: 'Uruguay',      flag2: '🇺🇾', score1: 2, score2: 2, status: 'ft',       time: 'FT',  group: 'R16',venue: 'Rose Bowl',       stadium: 'Pasadena' },
  { id: 8,  team1: 'Senegal',   flag1: '🇸🇳', team2: 'Croatia',      flag2: '🇭🇷', score1: 1, score2: 0, status: 'ft',       time: 'FT',  group: 'R16',venue: 'BC Place',        stadium: 'Vancouver' },
  { id: 9,  team1: 'South Korea',flag1:'🇰🇷', team2: 'Australia',   flag2: '🇦🇺', score1: null, score2: null, status: 'upcoming', time: '15:00', group: 'QF', venue: 'NRG Stadium',     stadium: 'Houston' },
  { id: 10, team1: 'Ecuador',   flag1: '🇪🇨', team2: 'Cameroon',    flag2: '🇨🇲', score1: 1, score2: 1, status: 'ft',       time: 'FT',  group: 'Grp B',venue:'Q2 Stadium',      stadium: 'Austin' },
]

export const TEAMS = [
  { id: 1,  name: 'Argentina',   flag: '🇦🇷', region: 'South America', rank: 1,  coach: 'Lionel Scaloni',      titles: 3, gf: 12, ga: 4,  pts: 12, form: ['W','W','D','W','W'], squad: ['Messi','Di María','Álvarez','Mac Allister','Romero'], confederation: 'CONMEBOL' },
  { id: 2,  name: 'France',      flag: '🇫🇷', region: 'Europe',        rank: 2,  coach: 'Didier Deschamps',    titles: 2, gf: 9,  ga: 5,  pts: 9,  form: ['W','W','L','W','D'], squad: ['Mbappé','Griezmann','Dembélé','Camavinga','Maignan'], confederation: 'UEFA' },
  { id: 3,  name: 'Brazil',      flag: '🇧🇷', region: 'South America', rank: 3,  coach: 'Dorival Júnior',      titles: 5, gf: 11, ga: 3,  pts: 12, form: ['W','W','W','D','W'], squad: ['Vinicius Jr','Rodrygo','Endrick','Paquetá','Marquinhos'], confederation: 'CONMEBOL' },
  { id: 4,  name: 'England',     flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', region: 'Europe',   rank: 4,  coach: 'Gareth Southgate',    titles: 1, gf: 8,  ga: 4,  pts: 10, form: ['W','D','W','W','L'], squad: ['Bellingham','Saka','Foden','Kane','Pickford'], confederation: 'UEFA' },
  { id: 5,  name: 'Spain',       flag: '🇪🇸', region: 'Europe',        rank: 5,  coach: 'Luis de la Fuente',   titles: 1, gf: 10, ga: 2,  pts: 12, form: ['W','W','W','W','D'], squad: ['Yamal','Pedri','Rodri','Morata','Carvajal'], confederation: 'UEFA' },
  { id: 6,  name: 'Germany',     flag: '🇩🇪', region: 'Europe',        rank: 6,  coach: 'Julian Nagelsmann',   titles: 4, gf: 7,  ga: 6,  pts: 7,  form: ['W','L','W','D','W'], squad: ['Müller','Kimmich','Wirtz','Musiala','Rüdiger'], confederation: 'UEFA' },
  { id: 7,  name: 'Portugal',    flag: '🇵🇹', region: 'Europe',        rank: 7,  coach: 'Roberto Martínez',    titles: 0, gf: 9,  ga: 5,  pts: 9,  form: ['W','W','L','W','W'], squad: ['Ronaldo','Bruno Fernandes','Leão','Dias','Costa'], confederation: 'UEFA' },
  { id: 8,  name: 'Netherlands', flag: '🇳🇱', region: 'Europe',        rank: 8,  coach: 'Ronald Koeman',       titles: 0, gf: 7,  ga: 4,  pts: 9,  form: ['D','W','W','W','D'], squad: ['Van Dijk','Gakpo','Dumfries','Simons','Reijnders'], confederation: 'UEFA' },
  { id: 9,  name: 'Japan',       flag: '🇯🇵', region: 'Asia',          rank: 18, coach: 'Hajime Moriyasu',     titles: 0, gf: 8,  ga: 6,  pts: 9,  form: ['W','W','D','W','L'], squad: ['Kubo','Doan','Minamino','Endo','Machino'], confederation: 'AFC' },
  { id: 10, name: 'Morocco',     flag: '🇲🇦', region: 'Africa',        rank: 13, coach: 'Walid Regragui',      titles: 0, gf: 5,  ga: 2,  pts: 10, form: ['W','D','W','W','W'], squad: ['Hakimi','Ziyech','En-Nesyri','Ounahi','Bounou'], confederation: 'CAF' },
  { id: 11, name: 'USA',         flag: '🇺🇸', region: 'CONCACAF',      rank: 11, coach: 'Mauricio Pochettino', titles: 0, gf: 6,  ga: 5,  pts: 7,  form: ['W','L','W','D','W'], squad: ['Pulisic','Reyna','Weah','McKennie','Turner'], confederation: 'CONCACAF' },
  { id: 12, name: 'Mexico',      flag: '🇲🇽', region: 'CONCACAF',      rank: 16, coach: 'Javier Aguirre',      titles: 0, gf: 5,  ga: 4,  pts: 6,  form: ['D','W','L','W','D'], squad: ['Jiménez','Álvarez J','Lozano','Guardado','Ochoa'], confederation: 'CONCACAF' },
  { id: 13, name: 'Senegal',     flag: '🇸🇳', region: 'Africa',        rank: 20, coach: 'Aliou Cissé',         titles: 0, gf: 4,  ga: 3,  pts: 7,  form: ['W','W','D','L','W'], squad: ['Mané','Sarr','Koulibaly','Diatta','Mendy'], confederation: 'CAF' },
  { id: 14, name: 'Croatia',     flag: '🇭🇷', region: 'Europe',        rank: 9,  coach: 'Zlatko Dalić',        titles: 0, gf: 5,  ga: 3,  pts: 8,  form: ['D','W','W','D','W'], squad: ['Modrić','Kovačić','Gvardiol','Perisić','Livaković'], confederation: 'UEFA' },
  { id: 15, name: 'Belgium',     flag: '🇧🇪', region: 'Europe',        rank: 9,  coach: 'Domenico Tedesco',    titles: 0, gf: 6,  ga: 5,  pts: 6,  form: ['W','D','L','W','W'], squad: ['De Bruyne','Lukaku','Courtois','Hazard','Tielemans'], confederation: 'UEFA' },
  { id: 16, name: 'Australia',   flag: '🇦🇺', region: 'Asia',          rank: 25, coach: 'Tony Popovic',        titles: 0, gf: 4,  ga: 4,  pts: 5,  form: ['D','W','L','W','D'], squad: ['Leckie','Hrustic','Irvine','Ryan','Kuol'], confederation: 'AFC' },
]

export const PLAYERS = [
  { id: 1,  name: 'Lionel Messi',     flag: '🇦🇷', pos: 'FW', club: 'Inter Miami',     age: 37, goals: 8,  assists: 5, nation: 'Argentina',   val: '€40M',  rating: 9.4, emoji: '⭐', height: '1.70m', weight: '72kg', caps: 189, intlGoals: 110 },
  { id: 2,  name: 'Kylian Mbappé',    flag: '🇫🇷', pos: 'FW', club: 'Real Madrid',     age: 25, goals: 7,  assists: 3, nation: 'France',      val: '€200M', rating: 9.1, emoji: '⚡', height: '1.78m', weight: '73kg', caps: 88,  intlGoals: 47 },
  { id: 3,  name: 'Vinicius Jr',      flag: '🇧🇷', pos: 'FW', club: 'Real Madrid',     age: 24, goals: 6,  assists: 4, nation: 'Brazil',      val: '€180M', rating: 9.0, emoji: '🔥', height: '1.76m', weight: '73kg', caps: 47,  intlGoals: 13 },
  { id: 4,  name: 'Erling Haaland',   flag: '🇳🇴', pos: 'FW', club: 'Man City',        age: 24, goals: 5,  assists: 1, nation: 'Norway',      val: '€200M', rating: 8.8, emoji: '💪', height: '1.94m', weight: '88kg', caps: 34,  intlGoals: 31 },
  { id: 5,  name: 'Pedri',            flag: '🇪🇸', pos: 'MF', club: 'Barcelona',       age: 22, goals: 3,  assists: 6, nation: 'Spain',       val: '€140M', rating: 8.9, emoji: '🎯', height: '1.74m', weight: '68kg', caps: 41,  intlGoals: 5 },
  { id: 6,  name: 'Jude Bellingham',  flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', pos: 'MF', club: 'Real Madrid',age: 21, goals: 4,  assists: 4, nation: 'England',     val: '€180M', rating: 8.7, emoji: '⚙️', height: '1.86m', weight: '83kg', caps: 46,  intlGoals: 16 },
  { id: 7,  name: 'Lamine Yamal',     flag: '🇪🇸', pos: 'FW', club: 'Barcelona',       age: 17, goals: 5,  assists: 7, nation: 'Spain',       val: '€150M', rating: 8.8, emoji: '🌟', height: '1.75m', weight: '65kg', caps: 18,  intlGoals: 7 },
  { id: 8,  name: 'Achraf Hakimi',    flag: '🇲🇦', pos: 'DF', club: 'PSG',             age: 26, goals: 2,  assists: 5, nation: 'Morocco',     val: '€80M',  rating: 8.5, emoji: '🛡️', height: '1.81m', weight: '73kg', caps: 79,  intlGoals: 15 },
  { id: 9,  name: 'Takefusa Kubo',    flag: '🇯🇵', pos: 'MF', club: 'Real Sociedad',   age: 23, goals: 3,  assists: 4, nation: 'Japan',       val: '€50M',  rating: 8.3, emoji: '🎭', height: '1.73m', weight: '67kg', caps: 39,  intlGoals: 5 },
  { id: 10, name: 'Rodri',            flag: '🇪🇸', pos: 'MF', club: 'Man City',        age: 28, goals: 1,  assists: 3, nation: 'Spain',       val: '€120M', rating: 9.0, emoji: '🏆', height: '1.91m', weight: '82kg', caps: 68,  intlGoals: 17 },
  { id: 11, name: 'Thibaut Courtois', flag: '🇧🇪', pos: 'GK', club: 'Real Madrid',     age: 32, goals: 0,  assists: 0, nation: 'Belgium',     val: '€30M',  rating: 8.6, emoji: '🧤', height: '1.99m', weight: '96kg', caps: 102, intlGoals: 0 },
  { id: 12, name: 'Raphinha',         flag: '🇧🇷', pos: 'FW', club: 'Barcelona',       age: 28, goals: 4,  assists: 3, nation: 'Brazil',      val: '€80M',  rating: 8.4, emoji: '🦅', height: '1.76m', weight: '68kg', caps: 47,  intlGoals: 16 },
  { id: 13, name: 'Christian Pulisic',flag: '🇺🇸', pos: 'FW', club: 'AC Milan',        age: 26, goals: 3,  assists: 2, nation: 'USA',         val: '€35M',  rating: 8.1, emoji: '🎯', height: '1.77m', weight: '70kg', caps: 68,  intlGoals: 28 },
  { id: 14, name: 'Hakim Ziyech',     flag: '🇲🇦', pos: 'MF', club: 'Galatasaray',     age: 31, goals: 2,  assists: 4, nation: 'Morocco',     val: '€15M',  rating: 8.0, emoji: '🌙', height: '1.81m', weight: '70kg', caps: 58,  intlGoals: 26 },
  { id: 15, name: 'Luka Modrić',      flag: '🇭🇷', pos: 'MF', club: 'Real Madrid',     age: 39, goals: 1,  assists: 3, nation: 'Croatia',     val: '€5M',   rating: 8.3, emoji: '👑', height: '1.72m', weight: '66kg', caps: 175, intlGoals: 24 },
  { id: 16, name: 'Kevin De Bruyne',  flag: '🇧🇪', pos: 'MF', club: 'Man City',        age: 33, goals: 2,  assists: 5, nation: 'Belgium',     val: '€50M',  rating: 8.7, emoji: '🎪', height: '1.81m', weight: '70kg', caps: 105, intlGoals: 28 },
]

export const GROUPS = {
  A: [
    { flag: '🇦🇷', name: 'Argentina',    mp: 3, w: 3, d: 0, l: 0, gf: 8,  ga: 2, pts: 9 },
    { flag: '🇲🇽', name: 'Mexico',       mp: 3, w: 1, d: 1, l: 1, gf: 4,  ga: 5, pts: 4 },
    { flag: '🇵🇱', name: 'Poland',       mp: 3, w: 1, d: 0, l: 2, gf: 3,  ga: 6, pts: 3 },
    { flag: '🇸🇦', name: 'Saudi Arabia', mp: 3, w: 0, d: 1, l: 2, gf: 2,  ga: 4, pts: 1 },
  ],
  B: [
    { flag: '🇫🇷', name: 'France',    mp: 3, w: 2, d: 1, l: 0, gf: 7, ga: 3, pts: 7 },
    { flag: '🇩🇰', name: 'Denmark',   mp: 3, w: 1, d: 1, l: 1, gf: 3, ga: 4, pts: 4 },
    { flag: '🇦🇺', name: 'Australia', mp: 3, w: 1, d: 1, l: 1, gf: 4, ga: 5, pts: 4 },
    { flag: '🇹🇳', name: 'Tunisia',   mp: 3, w: 0, d: 1, l: 2, gf: 1, ga: 3, pts: 1 },
  ],
  C: [
    { flag: '🇧🇷', name: 'Brazil',      mp: 3, w: 3, d: 0, l: 0, gf: 10, ga: 2, pts: 9 },
    { flag: '🇨🇭', name: 'Switzerland', mp: 3, w: 1, d: 1, l: 1, gf: 4,  ga: 5, pts: 4 },
    { flag: '🇷🇸', name: 'Serbia',      mp: 3, w: 1, d: 0, l: 2, gf: 3,  ga: 7, pts: 3 },
    { flag: '🇨🇲', name: 'Cameroon',    mp: 3, w: 0, d: 1, l: 2, gf: 2,  ga: 5, pts: 1 },
  ],
  D: [
    { flag: '🇫🇷', name: 'France',    mp: 3, w: 2, d: 0, l: 1, gf: 6, ga: 4, pts: 6 },
    { flag: '🇦🇺', name: 'Australia', mp: 3, w: 2, d: 0, l: 1, gf: 5, ga: 4, pts: 6 },
    { flag: '🇹🇳', name: 'Tunisia',   mp: 3, w: 1, d: 1, l: 1, gf: 3, ga: 4, pts: 4 },
    { flag: '🇩🇰', name: 'Denmark',   mp: 3, w: 0, d: 1, l: 2, gf: 2, ga: 4, pts: 1 },
  ],
}

export const NEWS = [
  { id: 1, cat: 'BREAKING',     emoji: '⚡', image: 'https://picsum.photos/seed/wc-goal-1/640/360',    title: "Messi scores brace to lead Argentina into semifinals",            time: '5 min ago',   color: '#f0b429' },
  { id: 2, cat: 'MATCH REPORT', emoji: '⚽', image: 'https://picsum.photos/seed/wc-match-2/640/360',  title: 'Spain dominate Germany with clinical counter-attack football',    time: '1 hour ago',  color: '#3b82f6' },
  { id: 3, cat: 'INJURY',       emoji: '🚑', image: 'https://picsum.photos/seed/wc-injury-3/640/360', title: "Mbappé injury scare but cleared to play vs Argentina",           time: '2 hours ago', color: '#ef4444' },
  { id: 4, cat: 'WORLD CUP',    emoji: '🏆', image: 'https://picsum.photos/seed/wc-crowd-4/640/360',  title: '2026 World Cup breaks all-time global viewership records',        time: '3 hours ago', color: '#10b981' },
  { id: 5, cat: 'TRANSFER',     emoji: '💰', image: 'https://picsum.photos/seed/wc-transfer-5/640/360',title: 'World Cup stars attracting €500M+ in summer transfer interest', time: '5 hours ago', color: '#f97316' },
  { id: 6, cat: 'TRENDING',     emoji: '🔥', image: 'https://picsum.photos/seed/wc-coach-6/640/360',  title: "Morocco's Walid Regragui named best coach of tournament",        time: '6 hours ago', color: '#06b6d4' },
  { id: 7, cat: 'HISTORY',      emoji: '📚', image: 'https://picsum.photos/seed/wc-brazil-7/640/360', title: 'Brazil chase record 6th World Cup title — can they do it?',      time: '8 hours ago', color: '#8b5cf6' },
  { id: 8, cat: 'FANZONE',      emoji: '🎉', image: 'https://picsum.photos/seed/wc-fans-8/640/360',   title: '1.5 billion viewers watched Germany vs Spain clash',             time: '12 hours ago',color: '#ec4899' },
  { id: 9, cat: 'STATS',        emoji: '📊', image: 'https://picsum.photos/seed/wc-stats-9/640/360',  title: 'xG analysis: Spain are the most clinical team left in WC',      time: '1 day ago',   color: '#64748b' },
]

export const TRIVIA_BANK = [
  { id: 1, q: 'How many times has Brazil won the FIFA World Cup?',          opts: ['3','4','5','6'],                           correct: 2, explain: 'Brazil has won the World Cup 5 times: 1958, 1962, 1970, 1994, and 2002.', emoji: '🇧🇷' },
  { id: 2, q: 'Who holds the all-time World Cup top scoring record?',       opts: ['Ronaldo','Pelé','Miroslav Klose','Müller'], correct: 2, explain: 'Miroslav Klose scored 16 goals across four World Cups (2002–2014).', emoji: '⚽' },
  { id: 3, q: 'How many teams participate in the 2026 FIFA World Cup?',     opts: ['32','40','48','64'],                       correct: 2, explain: 'The 2026 World Cup expanded to 48 teams for the first time.', emoji: '🌎' },
  { id: 4, q: 'Which country won the first FIFA World Cup in 1930?',        opts: ['Brazil','Argentina','Uruguay','Italy'],     correct: 2, explain: 'Uruguay won the inaugural World Cup on home soil in 1930.', emoji: '🏆' },
  { id: 5, q: "In what year did Pelé win his first World Cup title?",       opts: ['1954','1958','1962','1966'],                correct: 1, explain: 'A 17-year-old Pelé won his first World Cup in 1958 in Sweden.', emoji: '👑' },
  { id: 6, q: 'How many yellow cards equal an automatic suspension in WC?', opts: ['1','2','3','4'],                           correct: 1, explain: 'Two yellow cards in the group/knockout stages result in a one-match ban.', emoji: '🟨' },
  { id: 7, q: 'Who scored the fastest goal in World Cup history?',          opts: ['Miroslav Klose','Hakan Şükür','Ronaldo','Pelé'], correct: 1, explain: "Hakan Şükür scored after just 11 seconds vs South Korea in 2002.", emoji: '⏱️' },
  { id: 8, q: 'Which nation has appeared in the most World Cup finals?',    opts: ['Germany','Brazil','Italy','Argentina'],    correct: 0, explain: 'Germany (West Germany + Germany) has appeared in 8 World Cup finals.', emoji: '🥇' },
]

export const FUN_FACTS = [
  { emoji: '🏟️', fact: 'The 2026 World Cup uses 16 stadiums across 3 countries — first tri-hosted tournament in history.' },
  { emoji: '📺', fact: 'Over 5 billion viewers watched the 2022 Qatar World Cup. The 2026 edition is expected to shatter every record.' },
  { emoji: '⚽', fact: 'Just Fontaine scored 13 goals at the 1958 World Cup — a single-tournament record that has stood for 66+ years.' },
  { emoji: '🧤', fact: "Peter Shilton of England played 3 World Cups and holds the record for most WC appearances by a goalkeeper." },
  { emoji: '🎖️', fact: 'Germany and Brazil have qualified for every single World Cup in history — perfect attendance records.' },
  { emoji: '🔴', fact: 'The fastest red card in WC history was given to José Batista of Uruguay just 56 seconds into a 1986 match.' },
]

export const BRACKET_DATA = {
  QF: [
    { id: 'qf1', t1: 'Argentina 🇦🇷', t2: 'France 🇫🇷',      s1: 2,    s2: 1,    winner: 0 },
    { id: 'qf2', t1: 'Spain 🇪🇸',     t2: 'Germany 🇩🇪',     s1: 1,    s2: 0,    winner: 0 },
    { id: 'qf3', t1: 'Morocco 🇲🇦',   t2: 'Portugal 🇵🇹',    s1: 1,    s2: 0,    winner: 0 },
    { id: 'qf4', t1: 'Brazil 🇧🇷',    t2: 'Netherlands 🇳🇱', s1: null, s2: null, winner: -1 },
  ],
  SF: [
    { id: 'sf1', t1: 'Argentina 🇦🇷', t2: 'Spain 🇪🇸',   s1: null, s2: null, winner: -1 },
    { id: 'sf2', t1: 'Morocco 🇲🇦',   t2: 'TBD',          s1: null, s2: null, winner: -1 },
  ],
  F: [
    { id: 'f1',  t1: 'TBD', t2: 'TBD', s1: null, s2: null, winner: -1 },
  ],
}

export const STADIUMS = [
  { name: 'MetLife Stadium',    city: 'New York',     capacity: '82,500',  flag: '🇺🇸', host: 'Final' },
  { name: 'AT&T Stadium',       city: 'Dallas',       capacity: '100,000', flag: '🇺🇸', host: 'Semi Final' },
  { name: 'SoFi Stadium',       city: 'Los Angeles',  capacity: '70,000',  flag: '🇺🇸', host: 'Quarter Final' },
  { name: 'Estadio Azteca',     city: 'Mexico City',  capacity: '87,600',  flag: '🇲🇽', host: 'Opening Match' },
  { name: 'BC Place',           city: 'Vancouver',    capacity: '54,500',  flag: '🇨🇦', host: 'Group Stage' },
  { name: 'BMO Field',          city: 'Toronto',      capacity: '45,500',  flag: '🇨🇦', host: 'Group Stage' },
  { name: 'Gillette Stadium',   city: 'Boston',       capacity: '65,878',  flag: '🇺🇸', host: 'Quarter Final' },
  { name: 'Lumen Field',        city: 'Seattle',      capacity: '68,740',  flag: '🇺🇸', host: 'Quarter Final' },
]
