/* ============================================================
   《职场风云：KPI杀》 — Game Engine
   "互联网打工人 Meme Cartoon" Card Game
   ============================================================
   架构: Event-Driven Finite State Machine
   文件分8个逻辑模块 (Section A ~ H)
   ============================================================ */

// ============================================================
// SECTION A: DATA DEFINITIONS
// 卡牌库、角色库、身份配置 — 所有游戏数据集中管理
// ============================================================

const SUITS = {
  spade:   { symbol: '♠', color: 'black', name: '黑桃' },
  heart:   { symbol: '♥', color: 'red',   name: '红桃' },
  club:    { symbol: '♣', color: 'black', name: '梅花' },
  diamond: { symbol: '♦', color: 'red',   name: '方块' },
};

const VALUES = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];

/** Card Template definitions — the "blueprint" for each card type */
const CARD_TEMPLATES = [
  // === 基本牌 (Basic) ===
  { id:'shuaiguo',  name:'甩锅',   type:'basic', emoji:'🍳', desc:'对攻击范围内一名角色造成1点伤害',
    count:12, suits:['spade','spade','spade','spade','spade','club','club','club','club','club','diamond','diamond'] },
  { id:'jiaban',    name:'加班',   type:'basic', emoji:'💼', desc:'抵消一次【甩锅】',
    count:8,  suits:['heart','heart','heart','heart','diamond','diamond','diamond','diamond'] },
  { id:'zhujiaofan',name:'猪脚饭', type:'basic', emoji:'🍖', desc:'回复1点体力，或濒死时回复至1点',
    count:6,  suits:['heart','heart','heart','heart','heart','heart'] },
  { id:'coffee',    name:'咖啡',   type:'basic', emoji:'☕', desc:'出牌阶段限一次，令下一张【甩锅】伤害+1；或濒死时回复1点体力',
    count:2,  suits:['spade','club'] },

  // === 锦囊牌 (Trick) ===
  { id:'neibuzhaopin',name:'内部招聘',type:'trick',emoji:'📋',desc:'摸两张牌',
    count:3,  suits:['heart','heart','heart'] },
  { id:'lizhizhengming',name:'离职证明',type:'trick',emoji:'📄',desc:'弃置目标一张牌',
    count:3,  suits:['spade','spade','spade'] },
  { id:'waqiangjiao',name:'挖墙脚',type:'trick',emoji:'⛏️',desc:'获得目标一张牌',
    count:2,  suits:['spade','diamond'] },
  { id:'bumenhebing',name:'部门合并',type:'trick',emoji:'🏢',desc:'所有角色需打出【甩锅】，否则失去1点体力',
    count:1,  suits:['spade'] },
  { id:'quanyuanfupan',name:'全员复盘',type:'trick',emoji:'🔍',desc:'所有角色需打出【加班】，否则失去1点体力',
    count:1,  suits:['heart'] },
  { id:'tuanjian',  name:'团建',   type:'trick',emoji:'🎉',desc:'所有角色回复1点体力',
    count:1,  suits:['heart'] },
  { id:'nianzhongjiang',name:'年终奖',type:'trick',emoji:'🧧',desc:'亮出牌堆顶等同存活角色数的牌，从当前回合角色开始轮流选一张',
    count:1,  suits:['heart'] },
  { id:'jieguposhuairen',name:'借锅甩人',type:'trick',emoji:'🤝',desc:'令一名装备武器的角色对其攻击范围内另一角色使用【甩锅】',
    count:1,  suits:['club'] },
  { id:'duixian',   name:'对线',   type:'trick',emoji:'⚔️',desc:'目标需依次打出【甩锅】，否则失去1点体力',
    count:2,  suits:['spade','club'] },
  { id:'daibanshixiang',name:'待办事项',type:'trick',subtype:'delay',emoji:'📝',desc:'延时判定，非♥则跳过出牌阶段',
    count:2,  suits:['heart','spade'] },
  { id:'yusuandongjie',name:'预算冻结',type:'trick',subtype:'delay',emoji:'❄️',desc:'延时判定，非♣则跳过摸牌阶段',
    count:1,  suits:['club'] },
  { id:'996',       name:'996',    type:'trick',subtype:'delay',emoji:'🕐',desc:'延时判定：♥则跳过出牌阶段且手牌上限-1；非♥则摸一张牌，然后跳过出牌阶段',
    count:1,  suits:['spade'] },

  // === 装备牌 (Equipment) ===
  { id:'dingdingyidu',name:'钉钉已读',type:'equipment',subtype:'weapon',emoji:'📱',desc:'攻击范围2，可无限出【甩锅】',
    count:1, suits:['diamond'], range:2 },
  { id:'okrdapao',  name:'OKR大炮',type:'equipment',subtype:'weapon',emoji:'🚀',desc:'攻击范围5，命中可弃目标坐骑',
    count:1, suits:['spade'], range:5 },
  { id:'pipjihua',  name:'PIP计划',type:'equipment',subtype:'weapon',emoji:'📋',desc:'攻击范围3，当【甩锅】被【加班】抵消时，可弃置两张手牌强制命中',
    count:1, suits:['diamond'], range:3 },
  { id:'gezijian',  name:'格子间', type:'equipment',subtype:'armor',emoji:'🛡️',desc:'需要【加班】时，判定红色视为【加班】',
    count:1, suits:['spade'] },
  { id:'gongweijuli',name:'工位距离',type:'equipment',subtype:'plusHorse',emoji:'📏',desc:'与其他角色距离+1',
    count:1, suits:['club'] },
  { id:'gongxiangwendang',name:'共享文档',type:'equipment',subtype:'minusHorse',emoji:'📎',desc:'与其他角色距离-1',
    count:1, suits:['heart'] },
];

/** Character definitions */
const CHARACTERS = {
  boss: {
    id: 'boss', name: '老板', emoji: '👑', avatarBg: '#FFD700',
    maxHp: 4, isCEO: true,
    skills: [
      { name:'画饼', desc:'出牌阶段，将一张手牌交给另一名角色，其下回合内需对你使用一张【甩锅】，否则弃置两张牌。',
        trigger:'ON_PLAY_PHASE', limited:true, optional:true },
      { name:'融资', desc:'当你成为【甩锅】的目标时，可以弃置所有手牌（至少一张），取消之。',
        trigger:'ON_BECOME_TARGET', optional:true },
    ]
  },
  pm: {
    id: 'pm', name: '产品经理', emoji: '💻', avatarBg: '#FF8C42',
    maxHp: 4,
    skills: [
      { name:'改需求', desc:'出牌阶段限一次，弃置一张手牌，更改任意一张判定牌的结果（黑桃↔红桃，梅花↔方块）。',
        trigger:'ON_PLAY_PHASE', limited:true, optional:true },
      { name:'画大饼', desc:'摸牌阶段，可以放弃摸牌，改为令所有其他角色各选择一项：给你一张手牌，或让你摸一张牌。',
        trigger:'ON_DRAW_PHASE', limited:true, optional:true },
    ]
  },
  programmer: {
    id: 'programmer', name: '程序员', emoji: '⌨️', avatarBg: '#5B7DB1',
    maxHp: 4,
    skills: [
      { name:'上线', desc:'可将一张黑色手牌当【甩锅】使用或打出。',
        trigger:'ON_PLAY_PHASE', optional:true },
      { name:'背锅', desc:'当一名其他角色成为【对线】的目标，或成为【借锅甩人】的被迫攻击目标时，你可以代替其成为目标，然后摸一张牌。',
        trigger:'ON_BECOME_TARGET', optional:true },
    ]
  },
  ops: {
    id: 'ops', name: '运营总监', emoji: '📊', avatarBg: '#7C5BB1',
    maxHp: 4,
    skills: [
      { name:'数据美化', desc:'受到伤害后，摸一张牌并将一张手牌置于牌堆顶。',
        trigger:'AFTER_DAMAGE', optional:false },
      { name:'KPI冲刺', desc:'出牌阶段，弃置两张同花色手牌，对一名其他角色造成1点伤害。每阶段限一次。',
        trigger:'ON_PLAY_PHASE', limited:true, optional:true },
    ]
  },
  hrbp: {
    id: 'hrbp', name: 'HRBP', emoji: '📋', avatarBg: '#E53935',
    maxHp: 3,
    skills: [
      { name:'优化', desc:'死亡时，可选择一名其他角色，其失去所有手牌。',
        trigger:'AFTER_DEATH', optional:true },
      { name:'背调', desc:'出牌阶段，指定一名角色并声明一种花色，观看其手牌，若有该花色牌，获得其中一张。',
        trigger:'ON_PLAY_PHASE', limited:true, optional:true },
    ]
  },
  intern: {
    id: 'intern', name: '实习生', emoji: '🎒', avatarBg: '#43A047',
    maxHp: 3,
    skills: [
      { name:'打杂', desc:'回合开始时，可以弃置一张牌，本回合每使用一张基本牌，摸一张牌。',
        trigger:'ON_TURN_START', optional:true },
      { name:'转正', desc:'仅当身份为大厂实习生时获得。进入与CEO单挑状态时，立即回复1点体力并摸两张牌。',
        trigger:'ON_DUEL_STATE', optional:false, conditionIdentity:'大厂实习生' },
    ]
  },
};

/** Identity configuration for different player counts */
const IDENTITY_CONFIG = {
  4: [
    { identity:'CEO', displayName:'CEO', team:'lord' },
    { identity:'合伙人', displayName:'合伙人', team:'loyalist' },
    { identity:'部门总监', displayName:'部门总监', team:'rebel' },
    { identity:'大厂实习生', displayName:'大厂实习生', team:'traitor' },
  ],
  5: [
    { identity:'CEO', displayName:'CEO', team:'lord' },
    { identity:'合伙人', displayName:'合伙人', team:'loyalist' },
    { identity:'部门总监', displayName:'部门总监', team:'rebel' },
    { identity:'部门总监', displayName:'部门总监', team:'rebel' },
    { identity:'大厂实习生', displayName:'大厂实习生', team:'traitor' },
  ],
  6: [
    { identity:'CEO', displayName:'CEO', team:'lord' },
    { identity:'合伙人', displayName:'合伙人', team:'loyalist' },
    { identity:'部门总监', displayName:'部门总监', team:'rebel' },
    { identity:'部门总监', displayName:'部门总监', team:'rebel' },
    { identity:'部门总监', displayName:'部门总监', team:'rebel' },
    { identity:'大厂实习生', displayName:'大厂实习生', team:'traitor' },
  ],
};

/** Non-CEO characters that can be randomly assigned */
const NON_CEO_CHAR_IDS = ['pm', 'programmer', 'ops', 'hrbp', 'intern'];

const PHASES = ['JUDGMENT', 'DRAW', 'PLAY', 'DISCARD', 'END'];

// ============================================================
// SECTION B: EVENT BUS
// 发布/订阅系统 — 解耦游戏规则与角色技能
// ============================================================

class EventBus {
  constructor() {
    this._listeners = {};  // { eventName: [{callback, priority, id}] }
    this._idCounter = 0;
  }

  /** Register a listener. Returns an ID for unregistering. */
  on(event, callback, priority = 0) {
    if (!this._listeners[event]) this._listeners[event] = [];
    const id = ++this._idCounter;
    this._listeners[event].push({ id, callback, priority });
    this._listeners[event].sort((a, b) => b.priority - a.priority);
    return id;
  }

  /** Remove a specific listener by ID */
  off(event, id) {
    if (!this._listeners[event]) return;
    this._listeners[event] = this._listeners[event].filter(l => l.id !== id);
  }

  /** Remove all listeners for a given event (or all events if not specified) */
  offAll(event = null) {
    if (event) {
      delete this._listeners[event];
    } else {
      this._listeners = {};
    }
  }

  /**
   * Emit an event. Returns the (possibly modified) event data.
   * Listeners can set data.cancelled = true to stop propagation.
   */
  emit(event, data = {}) {
    if (!this._listeners[event]) return data;
    data._eventName = event;
    data.cancelled = false;
    for (const listener of this._listeners[event]) {
      listener.callback(data);
      if (data.cancelled) break;  // Stop propagation if cancelled
    }
    return data;
  }

  /** Check if any listeners exist for an event */
  hasListeners(event) {
    return this._listeners[event] && this._listeners[event].length > 0;
  }
}

// ============================================================
// SECTION C: GAME ENGINE (Finite State Machine)
// ============================================================

class GameEngine {
  constructor(playerCount = 5) {
    this.playerCount = playerCount;
    this.eventBus = new EventBus();
    this.state = this._createInitialState();
    this._pendingSkillPrompt = null;  // { skill, player } waiting for user input
    this._pendingTargetPrompt = null; // { card, validTargets } waiting for user input
  }

  /** Create fresh game state */
  _createInitialState() {
    return {
      players: [],
      currentPlayerIndex: 0,
      phase: 'SETUP',
      deck: [],
      discardPile: [],
      round: 1,
      log: [],
      winner: null,
      actionStack: [],
      humanPlayerIndex: 0,  // Human is always position 0
      difficulty: 'normal',
    };
  }

  /** Generate a unique card ID */
  _cardId() {
    return 'card_' + Math.random().toString(36).slice(2, 8);
  }

  /** Build the full 53-card deck */
  buildDeck() {
    const deck = [];
    let valueIndex = 0;
    for (const tpl of CARD_TEMPLATES) {
      for (let i = 0; i < tpl.count; i++) {
        const suitKey = tpl.suits[i % tpl.suits.length];
        const value = VALUES[valueIndex % 13];
        valueIndex++;
        deck.push({
          id: this._cardId(),
          templateId: tpl.id,
          name: tpl.name,
          type: tpl.type,
          subtype: tpl.subtype || null,
          suit: suitKey,
          suitSymbol: SUITS[suitKey].symbol,
          suitColor: SUITS[suitKey].color,
          value: value,
          description: tpl.desc,
          emoji: tpl.emoji,
          range: tpl.range || null,
        });
      }
    }
    return deck;
  }

  /** Shuffle array in place (Fisher-Yates) */
  shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /** Draw N cards from deck (reshuffle discard if needed) */
  drawCards(count) {
    const drawn = [];
    for (let i = 0; i < count; i++) {
      if (this.state.deck.length === 0) {
        if (this.state.discardPile.length === 0) break;
        this.state.deck = this.shuffle([...this.state.discardPile]);
        this.state.discardPile = [];
        this.addLog('🔄 牌堆已空，弃牌堆洗入牌堆', 'system');
      }
      drawn.push(this.state.deck.pop());
    }
    return drawn;
  }

  /** Add log entry */
  addLog(text, type = 'action') {
    this.state.log.push({ time: Date.now(), text, type });
    if (this.state.log.length > 200) this.state.log.shift();
  }

  /** Shuffle and assign identities to players */
  _assignIdentities() {
    const config = IDENTITY_CONFIG[this.playerCount];
    if (!config) throw new Error(`Unsupported player count: ${this.playerCount}`);
    const identities = this.shuffle([...config]);
    const players = [];

    // Create character pool
    const charPool = this.shuffle([...NON_CEO_CHAR_IDS]);

    for (let i = 0; i < this.playerCount; i++) {
      const identity = identities[i];

      // Boss always gets CEO identity
      let charId, charData;
      if (identity.identity === 'CEO') {
        charId = 'boss';
        charData = CHARACTERS.boss;
      } else {
        // Pick next non-boss character
        charId = charPool.pop();
        charData = CHARACTERS[charId];
      }

      const player = {
        id: `p${i}`,
        name: i === 0 ? '你' : `AI-${charData.name}`,
        characterId: charId,
        characterName: charData.name,
        characterEmoji: charData.emoji,
        avatarBg: charData.avatarBg,
        identity: identity.identity,
        identityDisplay: identity.displayName,
        identityTeam: identity.team,
        identityRevealed: false,
        hp: charData.maxHp,
        maxHp: charData.maxHp,
        hand: [],
        equipment: { weapon: null, armor: null, plusHorse: null, minusHorse: null },
        judgementArea: [],
        position: i,
        isAlive: true,
        isAI: i !== 0,
        isCEO: identity.identity === 'CEO',
        // Turn tracking
        usedShuaguo: false,
        usedCoffeeDamage: false,
        // Character skills
        skillDefs: charData.skills,
        // Active flags (set per turn)
        canUseSkill: true,
      };

      players.push(player);
    }

    this.state.players = players;
  }

  /** Deal initial 4 cards to each player */
  _dealInitialHands() {
    for (const player of this.state.players) {
      player.hand = this.drawCards(4);
    }
  }

  /** Set up a new game */
  setup() {
    this.state = this._createInitialState();
    this.state.deck = this.shuffle(this.buildDeck());
    this._assignIdentities();
    this._dealInitialHands();

    // Random starting player
    this.state.currentPlayerIndex = Math.floor(Math.random() * this.playerCount);
    this.state.round = 1;
    this.state.phase = 'JUDGMENT';

    this.addLog('🎮 游戏开始！身份已分配，每人摸4张起始手牌。', 'system');
    this.addLog(`👤 你是「${this.state.players[0].characterName}」，身份为「${this.state.players[0].identity}」`, 'system');
    this.addLog(`🎯 第${this.state.round}轮开始，轮到 ${this._currentPlayer().characterName}`, 'system');
  }

  /** Get current player */
  _currentPlayer() {
    return this.state.players[this.state.currentPlayerIndex];
  }

  /** Get human player */
  _humanPlayer() {
    return this.state.players[this.state.humanPlayerIndex];
  }

  /** Get alive players */
  getAlivePlayers() {
    return this.state.players.filter(p => p.isAlive);
  }

  /** Advance to next phase */
  advancePhase() {
    const phases = PHASES;
    const currentIdx = phases.indexOf(this.state.phase);

    if (currentIdx < phases.length - 1) {
      this.state.phase = phases[currentIdx + 1];
      this._onPhaseEnter();
    } else {
      // End of turn
      this._endTurn();
    }
  }

  /** Called when entering a phase */
  _onPhaseEnter() {
    const player = this._currentPlayer();
    switch (this.state.phase) {
      case 'JUDGMENT':
        // Resolve delay tricks on this player (Phase 3+)
        break;
      case 'DRAW':
        // Draw 2 cards (unless 预算冻结)
        if (player.isAlive) {
          const drawn = this.drawCards(2);
          player.hand.push(...drawn);
          this.addLog(`${player.characterName} 摸了 ${drawn.length} 张牌`, 'system');
        }
        break;
      case 'PLAY':
        // Reset turn counters
        player.usedShuaguo = false;
        player.usedCoffeeDamage = false;
        break;
      case 'DISCARD':
        // AI auto-discards; human waits
        if (player.isAI && player.isAlive) {
          this._aiDiscard(player);
          this.advancePhase();
        }
        break;
      case 'END':
        this.advancePhase(); // Auto-advance
        break;
    }
  }

  /** End current turn and move to next player */
  _endTurn() {
    const player = this._currentPlayer();
    this.addLog(`${player.characterName} 回合结束`, 'system');

    // Find next alive player
    let next = (this.state.currentPlayerIndex + 1) % this.playerCount;
    let attempts = 0;
    while (!this.state.players[next].isAlive && attempts < this.playerCount) {
      next = (next + 1) % this.playerCount;
      attempts++;
    }

    if (next <= this.state.currentPlayerIndex) {
      this.state.round++;
      this.addLog(`🔄 第${this.state.round}轮开始`, 'system');
    }

    this.state.currentPlayerIndex = next;
    this.state.phase = 'JUDGMENT';
    this.addLog(`🎯 轮到 ${this._currentPlayer().characterName} 的回合`, 'system');
  }

  /** AI discard logic: discard down to HP */
  _aiDiscard(player) {
    const discardCount = player.hand.length - player.hp;
    if (discardCount > 0) {
      const toDiscard = player.hand.splice(0, discardCount);
      this.state.discardPile.push(...toDiscard);
      this.addLog(`${player.characterName} 弃置了 ${discardCount} 张牌`, 'system');
    }
  }

  /** Check if game is over */
  checkVictory() {
    const alive = this.getAlivePlayers();
    const ceo = alive.find(p => p.isCEO);
    const rebels = alive.filter(p => p.identityTeam === 'rebel');
    const traitor = alive.find(p => p.identityTeam === 'traitor');
    const loyalists = alive.filter(p => p.identityTeam === 'loyalist');

    if (!ceo) {
      // CEO is dead
      if (rebels.length > 0) {
        return { over: true, winner: '部门总监', text: 'CEO已被拿下！部门总监（反贼）胜利！🎉' };
      } else if (traitor) {
        return { over: true, winner: '大厂实习生', text: '内奸笑到最后！大厂实习生单挑成功！🕵️' };
      } else {
        return { over: true, winner: '部门总监', text: 'CEO死亡！反贼胜利！（理论上不会出现此情况）' };
      }
    }

    if (rebels.length === 0 && !traitor) {
      return { over: true, winner: 'CEO & 合伙人', text: '所有反贼和内奸已清除！CEO和合伙人共同胜利！🏆' };
    }

    return { over: false };
  }

  /** Get all players within attack range of a given player */
  getPlayersInRange(player) {
    const alive = this.getAlivePlayers();
    const range = player.equipment.weapon ? player.equipment.weapon.range : 1;

    return alive.filter(target => {
      if (target.id === player.id) return false;
      const distance = this._calculateDistance(player, target);
      return distance <= range;
    });
  }

  /** Calculate distance between two players (circular seating) */
  _calculateDistance(p1, p2) {
    const total = this.playerCount;
    const diff = Math.abs(p1.position - p2.position);
    const clockwise = diff;
    const counterClockwise = total - diff;
    let distance = Math.min(clockwise, counterClockwise);

    // Apply horse modifiers
    if (p2.equipment.plusHorse) distance += 1;
    if (p1.equipment.minusHorse) distance -= 1;

    return Math.max(1, distance);
  }
}

// ============================================================
// SECTION D: ACTION RESOLVER (Minimal for Phase 0)
// ============================================================

class ActionResolver {
  constructor(engine) {
    this.engine = engine;
  }

  // Full implementation in Phase 1+
}

// ============================================================
// SECTION E: SKILL MANAGER (Stub for Phase 0)
// ============================================================

class SkillManager {
  constructor(engine) {
    this.engine = engine;
    this._listenerIds = {}; // playerId -> [eventBus ids]
  }

  registerSkills(player) {
    // Full implementation in Phase 5
  }

  unregisterSkills(playerId) {
    // Full implementation in Phase 5
  }
}

// ============================================================
// SECTION F: AI DECISION ENGINE (Stub for Phase 0)
// ============================================================

class AIDecisionMaker {
  constructor(engine) {
    this.engine = engine;
  }

  /** Make an AI decision for the current player. Returns an action. */
  decideAction(player) {
    // Phase 0: AI just passes (ends play phase)
    return { type: 'pass' };
  }

  /** AI decides whether to use a skill. Returns true/false. */
  decideSkill(player, skill) {
    return false; // Phase 0: never use skills
  }
}

// ============================================================
// SECTION G: UI CONTROLLER
// ============================================================

class UIController {
  constructor(engine) {
    this.engine = engine;
    this.selectedCardId = null;
    this._bindElements();
    this._bindEvents();
  }

  _bindElements() {
    this.els = {
      playerSeats: document.getElementById('player-seats'),
      deckCount: document.getElementById('deck-count'),
      discardCount: document.getElementById('discard-count'),
      logEntries: document.getElementById('log-entries'),
      handCards: document.getElementById('hand-cards'),
      handPlayerName: document.getElementById('hand-player-name'),
      handPlayerIdentity: document.getElementById('hand-player-identity'),
      roundBadge: document.getElementById('round-badge'),
      phaseBadge: document.getElementById('phase-badge'),
      btnEndPhase: document.getElementById('btn-end-phase'),
      limitIndicator: document.getElementById('limit-indicator'),
      phaseSteps: document.querySelectorAll('.phase-step'),
      startOverlay: document.getElementById('start-overlay'),
      btnStartGame: document.getElementById('btn-start-game'),
      btnCounts: document.querySelectorAll('.btn-count'),
      btnDiffs: document.querySelectorAll('.btn-diff'),
      skillModal: document.getElementById('skill-modal'),
      skillPromptText: document.getElementById('skill-prompt-text'),
      skillDetailText: document.getElementById('skill-detail-text'),
      btnSkillYes: document.getElementById('btn-skill-yes'),
      btnSkillNo: document.getElementById('btn-skill-no'),
      targetModal: document.getElementById('target-modal'),
      targetPromptText: document.getElementById('target-prompt-text'),
      targetOptions: document.getElementById('target-options'),
      btnTargetCancel: document.getElementById('btn-target-cancel'),
      victoryOverlay: document.getElementById('victory-overlay'),
      victoryTitle: document.getElementById('victory-title'),
      victoryDetail: document.getElementById('victory-detail'),
      victoryPlayers: document.getElementById('victory-players'),
      btnNewGame: document.getElementById('btn-new-game'),
      btnClearLog: document.getElementById('btn-clear-log'),
    };
  }

  _bindEvents() {
    // Start overlay
    this.els.btnCounts.forEach(btn => {
      btn.addEventListener('click', () => {
        this.els.btnCounts.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
    this.els.btnDiffs.forEach(btn => {
      btn.addEventListener('click', () => {
        this.els.btnDiffs.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
    this.els.btnStartGame.addEventListener('click', () => this._onStartGame());

    // Phase controls
    this.els.btnEndPhase.addEventListener('click', () => this._onEndPhase());

    // Skill modal
    this.els.btnSkillYes.addEventListener('click', () => this._onSkillResponse(true));
    this.els.btnSkillNo.addEventListener('click', () => this._onSkillResponse(false));
    this.els.btnTargetCancel.addEventListener('click', () => this._hideTargetModal());

    // New game
    this.els.btnNewGame.addEventListener('click', () => this._onNewGame());

    // Clear log
    this.els.btnClearLog.addEventListener('click', () => {
      this.els.logEntries.innerHTML = '';
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !this.els.startOverlay.classList.contains('hidden') === false) {
        // Enter to advance phase (only when it's human's turn)
      }
      if (e.key === 'e' && this.engine.state.phase === 'PLAY') {
        const cp = this.engine._currentPlayer();
        if (!cp.isAI) this._onEndPhase();
      }
    });
  }

  _onStartGame() {
    const countBtn = document.querySelector('.btn-count.active');
    const diffBtn = document.querySelector('.btn-diff.active');
    const playerCount = parseInt(countBtn.dataset.count);
    const difficulty = diffBtn.dataset.diff;

    this.engine.playerCount = playerCount;
    this.engine.state.difficulty = difficulty;
    this.engine.setup();

    this.els.startOverlay.classList.add('hidden');
    this.renderAll();
  }

  _onNewGame() {
    this.els.victoryOverlay.classList.add('hidden');
    this.els.startOverlay.classList.remove('hidden');
    this.selectedCardId = null;
  }

  _onEndPhase() {
    const state = this.engine.state;
    const cp = this.engine._currentPlayer();

    if (cp.isAI) return;

    if (state.phase === 'PLAY') {
      this.engine.advancePhase(); // Go to DISCARD
      // Human discard
      if (cp.hand.length > cp.hp) {
        this._promptDiscard(cp);
      } else {
        this.engine.advancePhase(); // Go to END, then next turn
      }
    } else if (state.phase === 'DISCARD') {
      // Already handled above
      this.engine.advancePhase();
    }

    this.renderAll();
    this._runAITurns();
  }

  /** Run AI turns until it's the human's turn again */
  _runAITurns() {
    const runOne = () => {
      const state = this.engine.state;
      if (state.winner) return;

      const cp = this.engine._currentPlayer();
      if (!cp.isAI) {
        this.renderAll();
        return;
      }

      if (!cp.isAlive) {
        this.engine._endTurn();
        this.renderAll();
        setTimeout(runOne, 400);
        return;
      }

      // AI auto-advances through all phases
      this.engine.advancePhase(); // JUDGMENT → DRAW
      this.engine.advancePhase(); // DRAW → PLAY
      // AI passes play phase
      this.engine.advancePhase(); // PLAY → DISCARD
      this.engine.advancePhase(); // DISCARD → END → next

      // Check victory
      const result = this.engine.checkVictory();
      if (result.over) {
        this.engine.state.winner = result.winner;
        this.engine.addLog(result.text, 'system');
        this.renderAll();
        this._showVictory(result);
        return;
      }

      this.renderAll();

      // Continue if still AI's turn
      if (this.engine._currentPlayer().isAI) {
        setTimeout(runOne, 600);
      }
    };

    setTimeout(runOne, 500);
  }

  _promptDiscard(player) {
    // Simple: auto-discard first N cards (will add UI in Phase 2)
    const excess = player.hand.length - player.hp;
    const toDiscard = player.hand.splice(0, excess);
    this.engine.state.discardPile.push(...toDiscard);
    this.engine.addLog(`${player.characterName} 弃置了 ${excess} 张牌（超过体力上限）`, 'system');
  }

  _onSkillResponse(use) {
    this.els.skillModal.classList.add('hidden');
    // Full implementation in Phase 5
  }

  _hideTargetModal() {
    this.els.targetModal.classList.add('hidden');
    this.selectedCardId = null;
    this.renderAll();
  }

  /** Show victory overlay */
  _showVictory(result) {
    this.els.victoryTitle.textContent = result.winner;
    this.els.victoryDetail.textContent = result.text;

    // Show all player identities
    this.els.victoryPlayers.innerHTML = '';
    for (const p of this.engine.state.players) {
      const badge = document.createElement('span');
      badge.className = 'victory-player-badge';
      badge.style.background = p.avatarBg;
      badge.textContent = `${p.characterEmoji} ${p.characterName}: ${p.identity}`;
      this.els.victoryPlayers.appendChild(badge);
    }

    this.els.victoryOverlay.classList.remove('hidden');
  }

  // ========== RENDER ==========

  renderAll() {
    this._renderSeats();
    this._renderDeckArea();
    this._renderLog();
    this._renderHand();
    this._renderPhaseUI();
  }

  _renderSeats() {
    const state = this.engine.state;
    const container = this.els.playerSeats;
    const cp = this.engine._currentPlayer();
    container.innerHTML = '';

    // Arrange players in a semicircle: human at center-bottom, others around
    // For rendering, we keep position order but visually the human is special
    for (const player of state.players) {
      const seat = document.createElement('div');
      seat.className = 'player-seat';
      seat.dataset.playerId = player.id;

      if (!player.isAlive) seat.classList.add('is-dead');
      if (player.id === cp.id && state.phase !== 'SETUP') seat.classList.add('is-current');

      // Avatar — use SVG character illustration
      const avatar = document.createElement('div');
      avatar.className = 'seat-avatar';
      avatar.style.background = player.avatarBg;
      const svgCharId = `char-${player.characterId}`;
      avatar.innerHTML = `<svg viewBox="0 0 160 240" class="seat-avatar-svg">
        <use href="#${svgCharId}"/>
      </svg>`;
      seat.appendChild(avatar);

      // Name
      const name = document.createElement('div');
      name.className = 'seat-name';
      name.textContent = player.characterName;
      if (player.id === 'p0') name.textContent += ' (你)';
      seat.appendChild(name);

      // HP hearts
      const hpDiv = document.createElement('div');
      hpDiv.className = 'seat-hp';
      for (let i = 0; i < player.maxHp; i++) {
        const heart = document.createElement('span');
        heart.className = 'hp-heart';
        heart.textContent = i < player.hp ? '❤️' : '🖤';
        if (i >= player.hp) heart.classList.add('empty');
        hpDiv.appendChild(heart);
      }
      seat.appendChild(hpDiv);

      // Hand count
      const handCount = document.createElement('span');
      handCount.className = 'seat-hand-count';
      handCount.textContent = `${player.hand.length} 张手牌`;
      seat.appendChild(handCount);

      // Equipment icons
      if (player.equipment.weapon || player.equipment.armor ||
          player.equipment.plusHorse || player.equipment.minusHorse) {
        const equipDiv = document.createElement('div');
        equipDiv.className = 'seat-equipment';
        if (player.equipment.weapon) equipDiv.appendChild(this._equipIcon(player.equipment.weapon));
        if (player.equipment.armor) equipDiv.appendChild(this._equipIcon(player.equipment.armor));
        if (player.equipment.plusHorse) equipDiv.appendChild(this._equipIcon(player.equipment.plusHorse));
        if (player.equipment.minusHorse) equipDiv.appendChild(this._equipIcon(player.equipment.minusHorse));
        seat.appendChild(equipDiv);
      }

      // For human: show identity
      if (player.id === 'p0') {
        const idBadge = document.createElement('span');
        idBadge.className = 'seat-identity-badge';
        idBadge.style.background = '#FFF';
        idBadge.textContent = player.identity;
        seat.appendChild(idBadge);
      }

      // Hover: show character card tooltip
      seat.addEventListener('mouseenter', (e) => this._showCharTooltip(player, e));
      seat.addEventListener('mouseleave', () => this._hideCharTooltip());
      seat.addEventListener('click', () => this._onSeatClick(player));

      container.appendChild(seat);
    }
  }

  _equipIcon(card) {
    const span = document.createElement('span');
    span.textContent = card.emoji;
    span.title = card.name;
    span.style.cursor = 'help';
    return span;
  }

  _renderDeckArea() {
    const state = this.engine.state;
    this.els.deckCount.textContent = state.deck.length;
    this.els.discardCount.textContent = state.discardPile.length;
  }

  _renderLog() {
    const state = this.engine.state;
    const container = this.els.logEntries;
    // Only add new entries
    const currentCount = container.children.length;
    const newEntries = state.log.slice(currentCount);

    for (const entry of newEntries) {
      const div = document.createElement('div');
      div.className = `log-entry ${entry.type}`;
      div.textContent = entry.text;
      container.appendChild(div);
    }

    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
  }

  _renderHand() {
    const state = this.engine.state;
    const human = this.engine._humanPlayer();
    const container = this.els.handCards;

    this.els.handPlayerName.textContent = `${human.characterEmoji} ${human.characterName}`;
    this.els.handPlayerIdentity.textContent = human.identity;
    this.els.handPlayerIdentity.className = 'identity-tag';
    // Color the identity tag by team
    switch (human.identityTeam) {
      case 'lord': this.els.handPlayerIdentity.style.background = '#FFD700'; break;
      case 'loyalist': this.els.handPlayerIdentity.style.background = '#FFD4A8'; break;
      case 'rebel': this.els.handPlayerIdentity.style.background = '#FFCDD2'; break;
      case 'traitor': this.els.handPlayerIdentity.style.background = '#D4C8F0'; break;
    }

    container.innerHTML = '';

    if (!human.isAlive) {
      const deadMsg = document.createElement('div');
      deadMsg.className = 'dead-message';
      deadMsg.textContent = '💀 你已阵亡，观战中…';
      deadMsg.style.cssText = 'color:var(--gray-600);font-size:18px;font-weight:700;';
      container.appendChild(deadMsg);
      return;
    }

    for (let i = 0; i < human.hand.length; i++) {
      const card = human.hand[i];
      const cardEl = this._createCardElement(card, false);
      cardEl.style.zIndex = i; // rightmost cards on top
      cardEl.addEventListener('click', () => this._onHandCardClick(card, cardEl));
      container.appendChild(cardEl);
    }
  }

  /** Create a DOM element for a card (meme-cartoon style) */
  _createCardElement(card, small = false) {
    const el = document.createElement('div');
    el.className = `game-card type-${card.type}`;
    if (small) el.classList.add('small');
    el.dataset.cardId = card.id;

    // Top-left corner (suit + value)
    const tl = document.createElement('div');
    tl.className = 'card-corner card-corner-tl';
    tl.innerHTML = `<span class="suit suit-${card.suitColor}">${card.suitSymbol}</span><span class="value">${card.value}</span>`;
    el.appendChild(tl);

    // Emoji bubble
    const bubble = document.createElement('div');
    bubble.className = 'card-emoji-wrap';
    bubble.textContent = card.emoji;
    el.appendChild(bubble);

    // Card name
    const name = document.createElement('div');
    name.className = 'card-name-display';
    name.textContent = card.name;
    el.appendChild(name);

    // Bottom-right corner
    const br = document.createElement('div');
    br.className = 'card-corner card-corner-br';
    br.innerHTML = `<span class="suit suit-${card.suitColor}">${card.suitSymbol}</span><span class="value">${card.value}</span>`;
    el.appendChild(br);

    return el;
  }

  /** Create card for display only (e.g., in tooltip) */
  createDisplayCard(cardData) {
    return this._createCardElement(cardData, false);
  }

  _renderPhaseUI() {
    const state = this.engine.state;
    const cp = this.engine._currentPlayer();
    const isHumanTurn = !cp.isAI;

    this.els.roundBadge.textContent = `Round ${state.round}`;

    const phaseNames = { JUDGMENT:'判定', DRAW:'摸牌', PLAY:'出牌', DISCARD:'弃牌', END:'结束' };
    this.els.phaseBadge.textContent = phaseNames[state.phase] || state.phase;

    // Update phase track
    this.els.phaseSteps.forEach(step => {
      const phase = step.dataset.phase;
      step.classList.remove('active', 'done');
      const phaseIdx = PHASES.indexOf(phase);
      const currentIdx = PHASES.indexOf(state.phase);
      if (phaseIdx < currentIdx) step.classList.add('done');
      if (phaseIdx === currentIdx) step.classList.add('active');
    });

    // Update limit indicator
    const used = cp.usedShuaguo ? '1' : '0';
    const weapon = cp.equipment.weapon;
    const max = (weapon && weapon.templateId === 'dingdingyidu') ? '∞' : '1';
    this.els.limitIndicator.textContent = `⚡ 甩锅: ${used}/${max}`;

    // Enable/disable end phase button
    const btn = this.els.btnEndPhase;
    if (!isHumanTurn || state.phase === 'END') {
      btn.disabled = true;
      btn.textContent = '⏳ 等待中…';
    } else if (state.phase === 'PLAY') {
      btn.disabled = false;
      btn.textContent = '⏭️ 结束出牌';
    } else if (state.phase === 'DISCARD') {
      btn.disabled = false;
      btn.textContent = '⏭️ 确认弃牌';
    } else {
      btn.disabled = false;
      btn.textContent = '⏭️ 继续';
    }
  }

  // ========== INTERACTION HANDLERS ==========

  _onSeatClick(player) {
    // Phase 0: no interaction
  }

  _showCharTooltip(player, event) {
    const tt = document.getElementById('card-tooltip');
    const content = tt.querySelector('.tooltip-card');
    const svgCharId = `char-${player.characterId}`;

    content.innerHTML = `
      <div class="character-card">
        <div class="character-card-art">
          <svg viewBox="0 0 160 240"><use href="#${svgCharId}"/></svg>
        </div>
        <div class="character-card-info">
          <div class="character-card-name">${player.characterEmoji} ${player.characterName}</div>
          <div class="character-card-hp">${'❤️'.repeat(player.hp)}${'🖤'.repeat(player.maxHp - player.hp)}</div>
          <div class="character-card-skills">
            ${player.skillDefs.map(s => `<span class="character-card-skill">【${s.name}】</span> ${s.desc}`).join('<br>')}
          </div>
        </div>
      </div>
    `;

    tt.classList.remove('hidden');
    const x = Math.min(event.clientX - 100, window.innerWidth - 220);
    const y = Math.max(10, event.clientY - 300);
    tt.style.left = x + 'px';
    tt.style.top = y + 'px';
  }

  _hideCharTooltip() {
    document.getElementById('card-tooltip').classList.add('hidden');
  }

  _onHandCardClick(card, cardEl) {
    const state = this.engine.state;
    const cp = this.engine._currentPlayer();
    if (cp.isAI) return;
    if (state.phase !== 'PLAY') return;

    // Toggle selection
    if (this.selectedCardId === card.id) {
      this.selectedCardId = null;
      cardEl.classList.remove('selected');
    } else {
      // Deselect previous
      const prev = document.querySelector('.game-card.selected');
      if (prev) prev.classList.remove('selected');
      this.selectedCardId = card.id;
      cardEl.classList.add('selected');
    }
  }

  /** Show a skill prompt modal (for future phases) */
  showSkillPrompt(skill, player, callback) {
    this.els.skillPromptText.textContent = `是否发动【${skill.name}】？`;
    this.els.skillDetailText.textContent = skill.desc;
    this.els.skillModal.classList.remove('hidden');

    this._pendingSkillCallback = callback;
  }

  /** Show target selection modal */
  showTargetPrompt(card, validTargets, callback) {
    this.els.targetPromptText.textContent = `选择【${card.name}】的目标：`;
    this.els.targetOptions.innerHTML = '';

    for (const target of validTargets) {
      const btn = document.createElement('button');
      btn.className = 'target-option';
      btn.textContent = `${target.characterEmoji} ${target.characterName}`;
      btn.addEventListener('click', () => {
        this.els.targetModal.classList.add('hidden');
        callback(target);
      });
      this.els.targetOptions.appendChild(btn);
    }

    this.els.targetModal.classList.remove('hidden');
  }
}

// ============================================================
// SECTION H: APP ENTRY POINT
// ============================================================

class GameApp {
  constructor() {
    this.engine = new GameEngine(5);
    this.resolver = new ActionResolver(this.engine);
    this.skills = new SkillManager(this.engine);
    this.ai = new AIDecisionMaker(this.engine);
    this.ui = new UIController(this.engine);

    this.ui.renderAll();

    // Expose debug API
    this._setupDebug();
  }

  _setupDebug() {
    window.__game = {
      engine: this.engine,
      ui: this.ui,
      drawCards: (n) => {
        const human = this.engine._humanPlayer();
        const drawn = this.engine.drawCards(n);
        human.hand.push(...drawn);
        this.ui.renderAll();
        console.log(`给了 ${n} 张牌:`, drawn.map(c => c.name));
      },
      setHP: (hp) => {
        const human = this.engine._humanPlayer();
        human.hp = Math.min(hp, human.maxHp);
        this.ui.renderAll();
        console.log(`HP set to ${human.hp}`);
      },
      skipTurn: () => {
        this.engine._endTurn();
        this.ui.renderAll();
        this.ui._runAITurns();
        console.log('Turn skipped');
      },
      revealAll: () => {
        for (const p of this.engine.state.players) {
          p.identityRevealed = true;
        }
        this.ui.renderAll();
        console.table(this.engine.state.players.map(p => ({
          name: p.characterName, identity: p.identity, hp: p.hp, hand: p.hand.length
        })));
      },
      state: () => this.engine.state,
      log: () => this.engine.state.log,
    };

    console.log('%c🏢 职场风云：KPI杀 %cDev Tools Ready',
      'font-size:20px;font-weight:bold;', 'font-size:14px;');
    console.log('%c__game.drawCards(n) %c— 获得n张牌',
      'font-weight:bold;', 'color:#666');
    console.log('%c__game.setHP(n) %c— 设置体力',
      'font-weight:bold;', 'color:#666');
    console.log('%c__game.skipTurn() %c— 跳过当前回合',
      'font-weight:bold;', 'color:#666');
    console.log('%c__game.revealAll() %c— 揭示所有身份',
      'font-weight:bold;', 'color:#666');
    console.log('%c__game.state() %c— 查看游戏状态',
      'font-weight:bold;', 'color:#666');
  }
}

// ============================================================
// BOOT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  window._app = new GameApp();
});
