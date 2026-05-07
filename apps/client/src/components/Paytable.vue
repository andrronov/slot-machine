<script setup>
import { SYMBOLS_MAP } from "@slot-machine/shared";

const showPaytable = defineModel({ default: false, required: true });

const closePaytable = () => {
  showPaytable.value = false;
};
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showPaytable"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-md"
        @click.self="closePaytable"
      >
        <div
          class="glass-panel p-8 rounded-[32px] max-w-3xl w-[90%] max-h-[85vh] overflow-y-auto relative shadow-2xl"
        >
          <button
            @click="closePaytable"
            class="btn icon-btn absolute top-6 right-6 !border-none bg-black/10 hover:bg-black/20"
          >
            ✕
          </button>

          <h2 class="text-3xl font-bold text-center mb-8 text-[#1d1d1f]">
            Paytable & Rules
          </h2>

          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            <div
              v-for="symbol in SYMBOLS_MAP"
              :key="symbol.id"
              class="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/30 border border-white/40 shadow-sm hover:scale-105 transition-transform"
            >
              <img
                :src="symbol.img"
                :alt="symbol.name"
                class="w-16 h-16 object-contain drop-shadow-md mb-3"
              />

              <span
                class="text-sm font-semibold text-[#1d1d1f] text-center mb-1 leading-tight"
              >
                {{ symbol.name }}
              </span>

              <span
                class="text-base font-bold text-[color:var(--color-success)] font-[SF Pro Rounded] tabular-nums"
              >
                x{{ symbol.payoutMultiplier }}
              </span>
            </div>
          </div>

          <div class="mt-8 text-center text-sm font-medium text-[#515154]">
            <p>Wins are multiplied by your current stake.</p>
            <p>Wild symbol substitutes for all other symbols.</p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
