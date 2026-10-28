// Smart Bot AI for Tiến Lên Miền Nam
import { VALUES, COMBO_TYPE, findValidPlays, sortCards } from './engine.js';

export const AI_DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
};

export class BotAI {
  constructor(difficulty = AI_DIFFICULTY.MEDIUM) {
    this.difficulty = difficulty;
    this.playedCards = new Set();
  }

  reset() {
    this.playedCards.clear();
  }

  recordPlayed(cards) {
    for (const c of cards) {
      this.playedCards.add(c.id);
    }
  }

  // Choose the best move from the valid moves
  chooseMove(hand, prevCombo = null, isNewRound = true, mustIncludeCard = null, otherHandSizes = []) {
    const validPlays = findValidPlays(hand, prevCombo, isNewRound, mustIncludeCard);

    if (validPlays.length === 0) {
      return null; // Pass
    }

    if (this.difficulty === AI_DIFFICULTY.EASY) {
      return this.chooseEasyMove(validPlays, isNewRound);
    } else if (this.difficulty === AI_DIFFICULTY.MEDIUM) {
      return this.chooseMediumMove(validPlays, isNewRound, prevCombo, hand);
    } else {
      return this.chooseHardMove(validPlays, isNewRound, prevCombo, hand, otherHandSizes);
    }
  }

  chooseEasyMove(validPlays, isNewRound) {
    // If not new round, 30% chance to pass even if can play (mimicking careless play)
    if (!isNewRound && Math.random() < 0.3) {
      return null;
    }
    const idx = Math.floor(Math.random() * validPlays.length);
    return validPlays[idx];
  }

  chooseMediumMove(validPlays, isNewRound, prevCombo, hand) {
    // If new round: prefer starting with lowest sảnh, then lowest pair, then lowest single. Avoid opening with a 2!
    if (isNewRound) {
      // Sort plays by lowest highestCard
      validPlays.sort((a, b) => a.highestCard.compareTo(b.highestCard));

      // Filter out plays that start with a 2 unless that's all we have
      const nonTwos = validPlays.filter(p => !p.highestCard.isTwo());
      const pool = nonTwos.length > 0 ? nonTwos : validPlays;

      // Prefer multi-card plays (sảnh > pair > single)
      const straights = pool.filter(p => p.type === COMBO_TYPE.STRAIGHT);
      if (straights.length > 0) return straights[0];

      const pairs = pool.filter(p => p.type === COMBO_TYPE.PAIR);
      if (pairs.length > 0) return pairs[0];

      return pool[0];
    }

    // Following turn:
    // Sort candidate plays by least waste (smallest highest card)
    validPlays.sort((a, b) => a.highestCard.compareTo(b.highestCard));

    // If opponent played a normal single/pair and we can only beat by playing a 2:
    // Only play 2 if hand is short (<= 3 cards) or 50% chance
    const smallest = validPlays[0];
    if (smallest.highestCard.isTwo() && (!prevCombo || !prevCombo.highestCard.isTwo())) {
      if (hand.length > 3 && Math.random() < 0.5) {
        return null; // Pass to save the 2
      }
    }

    return smallest;
  }

  chooseHardMove(validPlays, isNewRound, prevCombo, hand, otherHandSizes) {
    const minEnemyCards = otherHandSizes.length > 0 ? Math.min(...otherHandSizes) : 13;

    // Emergency mode: someone has 1 or 2 cards left! We must block them!
    const urgentDefense = minEnemyCards <= 2;

    if (isNewRound) {
      // If someone has 1 card left, avoid playing small singles! Play pairs or straights!
      if (minEnemyCards === 1) {
        const nonSingles = validPlays.filter(p => p.type !== COMBO_TYPE.SINGLE);
        if (nonSingles.length > 0) {
          nonSingles.sort((a, b) => a.highestCard.compareTo(b.highestCard));
          return nonSingles[0];
        }
      }

      // Prioritize longest straight to shed many cards at once
      const straights = validPlays.filter(p => p.type === COMBO_TYPE.STRAIGHT);
      if (straights.length > 0) {
        straights.sort((a, b) => b.cards.length - a.cards.length || a.highestCard.compareTo(b.highestCard));
        return straights[0];
      }

      // Then triples, pairs, singles
      validPlays.sort((a, b) => a.highestCard.compareTo(b.highestCard));
      const nonTwos = validPlays.filter(p => !p.highestCard.isTwo());
      return (nonTwos.length > 0 ? nonTwos : validPlays)[0];
    }

    // Defending:
    validPlays.sort((a, b) => a.highestCard.compareTo(b.highestCard));

    // If opponent played a 2, and we have special hàng (3 pairs, quad, 4 pairs):
    // ALWAYS CHOP! Chặt heo earns points/money!
    const chops = validPlays.filter(p =>
      p.type === COMBO_TYPE.THREE_CONSECUTIVE_PAIRS ||
      p.type === COMBO_TYPE.FOUR_OF_A_KIND ||
      p.type === COMBO_TYPE.FOUR_CONSECUTIVE_PAIRS
    );
    if (chops.length > 0 && prevCombo && prevCombo.highestCard.isTwo()) {
      return chops[0];
    }

    // If opponent has 1 card left, and they played a single, play our highest single to block them!
    if (urgentDefense && prevCombo && prevCombo.type === COMBO_TYPE.SINGLE) {
      // Find highest single that beats it
      const singles = validPlays.filter(p => p.type === COMBO_TYPE.SINGLE);
      if (singles.length > 0) {
        singles.sort((a, b) => b.highestCard.compareTo(a.highestCard));
        return singles[0];
      }
    }

    return validPlays[0];
  }
}
