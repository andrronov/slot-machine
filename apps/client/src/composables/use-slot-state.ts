import { ref } from "vue";
import { useLocalStorage } from "@vueuse/core";
import type { SpinResult } from "@slot-machine/shared/types";

export const useSlotState = () => {
  const balance = useLocalStorage("sm-balance", 500);
  const stake = ref(1);
  const spinning = ref(false);

  const deductBalance = (amount: number) => {
    balance.value -= amount;
  };
  const addBalance = (amount: number) => {
    if (amount > 0) {
      balance.value += amount;
    }
  };

  const increaseStake = () => {
    stake.value = Math.min(10, stake.value + 1);
  };
  const decreaseStake = () => {
    stake.value = Math.max(1, stake.value - 1);
  };

  const fetchResult = async () => {
    const result = await fetch(`${import.meta.env.VITE_API_URL}/spin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ stake: stake.value }),
    });
    const data = (await result.json()) as SpinResult;
    return data;
  };

  return {
    balance,
    stake,
    spinning,

    deductBalance,
    addBalance,

    increaseStake,
    decreaseStake,

    fetchResult,
  };
};
