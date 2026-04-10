<script setup lang="ts">
import { useTemplateRef, onMounted } from "vue";
import { useSlotMachine } from "./composables/use-slot-machine";

const pixiContainer = useTemplateRef<HTMLElement | null>("pixiContainer");

const { initPixi, spin, balance, stake, isSpinning } = useSlotMachine();

const increaseStake = () => {
  if (stake.value < 10) stake.value += 1;
};

const decreaseStake = () => {
  if (stake.value > 1) stake.value -= 1;
};

onMounted(() => {
  if (pixiContainer.value) {
    initPixi(pixiContainer.value);
  }
});
</script>

<template>
  <div class="body">
    <div class="slot-machine">
      <header class="ui-header">
        <div class="stat-box">
          <span class="label">Balance:</span>
          <span class="value success">${{ balance }}</span>
        </div>
        <div class="stat-box">
          <span class="label">Stake:</span>
          <span class="value warning">${{ stake }}</span>
        </div>
      </header>

      <div class="canvas-container" ref="pixiContainer"></div>

      <footer class="ui-footer">
        <div class="stake-controls">
          <button
            @click="decreaseStake"
            :disabled="isSpinning || stake <= 1"
            class="btn icon-btn"
          >
            -
          </button>
          <span class="stake-display">${{ stake }}</span>
          <button
            @click="increaseStake"
            :disabled="isSpinning || stake >= 10"
            class="btn icon-btn"
          >
            +
          </button>
        </div>

        <button
          @click="spin"
          :disabled="isSpinning || balance < stake"
          class="btn spin-btn"
          :class="{ 'is-spinning': isSpinning }"
        >
          {{ isSpinning ? "SPINNING..." : "SPIN" }}
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
  background: linear-gradient(to bottom, #000000, #0e3b2d);
}

.slot-machine {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #1a1a2e;
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
  background: #0f0f1a;
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
}

.label {
  color: #8b8ba7;
  margin-right: 8px;
  font-size: 1rem;
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
  padding: 15px 40px;
  border-radius: 30px;
  font-size: 1.2rem;
  letter-spacing: 2px;
  background: linear-gradient(135deg, #ec4899, #8b5cf6);
  box-shadow: 0 4px 15px rgba(236, 72, 153, 0.4);
}

.spin-btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(236, 72, 153, 0.6);
}

.spin-btn.is-spinning {
  background: #374151;
  box-shadow: inset 0 4px 6px rgba(0, 0, 0, 0.3);
}
</style>
