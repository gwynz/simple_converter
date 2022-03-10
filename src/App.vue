<template>
  <div id="app">
    <div class="w-full h-screen flex justify-center items-center bg-purple-900">
      <SwapCurrency />
    </div>
  </div>
</template>

<script>
import SwapCurrency from "./components/swapCurrency";

export default {
  name: "App",
  components: {
    SwapCurrency,
  },
};
</script>
