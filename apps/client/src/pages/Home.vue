<script setup lang="ts">
import {
  ref,
  useTemplateRef,
  computed,
  onMounted,
  onUnmounted,
  watch,
} from "vue";
import { onKeyStroke } from "@vueuse/core";
import gsap from "gsap";
import Paytable from "../components/Paytable.vue";
import { SlotEngine } from "../features/slot-engine";
import { useSlotState } from "../composables/use-slot-state";
import { Keys } from "../types";

const pixiContainer = useTemplateRef<HTMLElement | null>("pixiContainer");
const slot = new SlotEngine();
const {
  balance,
  stake,
  spinning,
  deductBalance,
  addBalance,
  fetchResult,
  decreaseStake,
  increaseStake,
} = useSlotState();

const paylinesVisible = ref(false);
const paytableVisible = ref(false);

const winAmount = ref(0);
const rawBalance = ref(balance.value);
const canSpin = computed(() => !spinning.value && balance.value >= stake.value);
const displayBalance = computed(() => rawBalance.value.toFixed(2));

const handleSpin = async () => {
  if (!canSpin.value) return;

  spinning.value = true;
  paylinesVisible.value = false;
  winAmount.value = 0;
  slot.startSpin();
  deductBalance(stake.value);

  try {
    const { serverResult, win, winningLines } = await fetchResult();
    slot.completeSpin(serverResult, () => {
      slot.checkWin(win, winningLines);
      addBalance(win);
      winAmount.value = win;
      spinning.value = false;
    });
  } catch (err) {
    slot.stopSpin(() => {
      addBalance(stake.value);
      spinning.value = false;
    });
  }
};

const togglePaylines = () => {
  if (spinning.value) return;

  paylinesVisible.value = !paylinesVisible.value;
  slot.toggleAllPaylines(paylinesVisible.value);
};

onMounted(() => {
  if (pixiContainer.value) {
    slot.init(pixiContainer.value);
  }
});
onUnmounted(() => slot.destroy());

onKeyStroke(Keys.Space, () => {
  handleSpin();
});
onKeyStroke(Keys.Backspace, () => {
  togglePaylines();
});

watch(balance, (newVal) => {
  gsap.to(rawBalance, {
    value: newVal,
    duration: 1.25,
    ease: "power2.out",
  });
});
</script>

<template>
  <div class="w-full h-screen flex items-center justify-center">
    <div class="slot-machine">
      <header>
        <div class="stat-box min-w-45 justify-between">
          <span class="label">Balance:</span>
          <span class="value text-success text-right min-w-20 inline-block">
            ${{ displayBalance }}
          </span>
        </div>
        <div class="flex items-center gap-4">
          <div v-if="winAmount > 0" class="stat-box">
            <span class="value text-warning">Win! ${{ winAmount }}</span>
          </div>
          <div class="stat-box">
            <span class="label">Stake:</span>
            <span class="value text-warning">${{ stake }}</span>
          </div>
          <button
            @click="paytableVisible = true"
            class="btn icon-btn"
            title="Paytable"
          >
            i
          </button>
        </div>
      </header>

      <div class="canvas-container" ref="pixiContainer"></div>

      <footer>
        <button
          @click="togglePaylines"
          :disabled="spinning"
          class="btn toggle-btn"
        >
          {{ paylinesVisible ? "HIDE LINES" : "SHOW LINES" }}
        </button>
        <div class="stake-controls">
          <button
            @click="decreaseStake()"
            :disabled="spinning || stake <= 1"
            class="btn icon-btn"
          >
            -
          </button>
          <span class="stake-display">${{ stake }}</span>
          <button
            @click="increaseStake()"
            :disabled="spinning || stake >= 10"
            class="btn icon-btn"
          >
            +
          </button>
        </div>

        <button
          @click="handleSpin"
          :disabled="!canSpin"
          class="btn spin-btn"
          :class="{ 'is-spinning': !canSpin }"
        >
          {{ spinning ? "..." : "SPIN" }}
        </button>
      </footer>
    </div>
  </div>

  <Paytable v-model="paytableVisible" />
</template>
