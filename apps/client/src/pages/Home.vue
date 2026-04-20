<script setup lang="ts">
import {
  ref,
  useTemplateRef,
  computed,
  onMounted,
  onUnmounted,
  watch,
} from "vue";
import gsap from "gsap";
import { SlotEngine } from "../features/slot-engine";
import { useSlotState } from "../composables/use-slot-state";

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
const winAmount = ref(0);
const canSpin = computed(() => !spinning.value && balance.value >= stake.value);
const displayBalance = ref(balance.value);

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

watch(balance, (newVal) => {
  const numDecimals = newVal.toString().split(".")[1]?.length ?? 0;

  gsap.to(displayBalance, {
    value: newVal,
    duration: 1.25,
    ease: "power2.out",
    onUpdate: () => {
      displayBalance.value = Number(displayBalance.value.toFixed(numDecimals));
    },
  });
});
</script>

<template>
  <div class="body">
    <div class="slot-machine">
      <header class="ui-header">
        <div class="stat-box">
          <span class="label">Balance:</span>
          <span class="value success">${{ displayBalance }}</span>
        </div>
        <div class="flex items-center gap-4">
          <div v-if="winAmount > 0" class="stat-box">
            <span class="value warning">Win! ${{ winAmount }}</span>
          </div>
          <div class="stat-box">
            <span class="label">Stake:</span>
            <span class="value warning">${{ stake }}</span>
          </div>
        </div>
      </header>

      <div class="canvas-container" ref="pixiContainer"></div>

      <footer class="ui-footer">
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
</template>

<style scoped>
.body {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(270deg, #0f2027, #203a43, #2c5364, #1c1c2b);
  background-size: 600% 600%;
  animation: gradientShift 38s ease infinite;
}

.slot-machine {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(26, 26, 46, 0.35);
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  width: fit-content;
  margin: 0 auto;
  font-family: "Inter", sans-serif;
  color: white;
}

.canvas-container {
  width: 640px;
  height: 325px;
  background: rgba(15, 15, 26, 0.55);
  border: 4px solid #2d2d44;
  border-radius: 12px;
  overflow: hidden;
  margin: 20px 0;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.8);
}

.ui-header,
.ui-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.stat-box {
  background: #252542;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 1.2rem;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
  cursor: default;
}

.label {
  color: #8b8ba7;
  margin-right: 8px;
  font-size: 1rem;
}

.value {
  font-variant-numeric: tabular-nums;
}
.value.success {
  color: #4ade80;
}
.value.warning {
  color: #facc15;
}

.stake-controls {
  display: flex;
  align-items: center;
  gap: 15px;
  background: #252542;
  padding: 5px 15px;
  border-radius: 30px;
}

.stake-display {
  font-size: 1.2rem;
  font-weight: bold;
  min-width: 40px;
  text-align: center;
  cursor: default;
}

.btn {
  background: #4f46e5;
  color: white;
  border: none;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;
}

.btn:disabled {
  background: #374151;
  color: #6b7280;
  cursor: not-allowed;
  transform: none;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn:not(:disabled):hover {
  background: #6366f1;
  transform: scale(1.1);
}

.spin-btn {
  min-width: 135px;
  padding: 15px 40px;
  border-radius: 30px;
  font-size: 1.2rem;
  letter-spacing: 2px;
  background: linear-gradient(135deg, #ec4899, #8b5cf6);
  box-shadow: 0 4px 15px rgba(236, 72, 153, 0.4);
}
.toggle-btn {
  min-width: 160px;
  padding: 15px 20px;
  border-radius: 30px;
  font-size: 1rem;
  letter-spacing: 2px;
  background: linear-gradient(35deg, #ed2699, #8c3df6);
  box-shadow: 0 2.5px 10px rgba(236, 72, 153, 0.4);
}

.spin-btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(236, 72, 153, 0.6);
}

.spin-btn.is-spinning {
  background: #374151;
  box-shadow: inset 0 4px 6px rgba(0, 0, 0, 0.3);
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>
