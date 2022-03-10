<template>
  <div class="relative bg-gray-900">
    <input
      v-model="amountInputValue"
      type="number"
      minlength="0"
      pattern="^[0-9]*[.,]?[0-9]*$"
      maxlength="79"
      name="price"
      class="block w-full pl-4 pr-24 py-2 sm:text-sm rounded-md text-gray-800 outline-none"
      placeholder="0.0"
    />
    <div class="absolute inset-y-0 right-0 flex items-center">
      <label for="currency" class="sr-only">Currency</label>
      <select
        :disabled="!tokenData || !tokenData.length"
        v-model="tokenInputValue"
        id="currency"
        name="currency"
        class="h-full w-28 block py-0 mr-2 border-transparent bg-transparent text-gray-800 sm:text-sm rounded-md outline-none focus:outline-none"
      >
        <option
          v-for="value in tokenData"
          :key="value.tokenId"
          :value="value.tokenId"
          :class="{'text-right bg-light-900': tokenInputValue === value.tokenId}"
        >
          {{ value.symbol }}
        </option>
      </select>
    </div>
  </div>
</template>

<script>
export default {
  name: "currencyInputComponent",
  props: {
    currentToken: {
      type: Object,
    },
    currentAmount: {
      type: [Number, String],
    },
    tokenData: {
      type: [Array],
    },
  },
  computed: {
    amountInputValue: {
      get() {
        return this.currentAmount;
      },
      set: function (value) {
        this.$emit("update:currentAmount", Number(value) || 0);
        this.$emit("calculatorAmount");
      },
    },
    tokenInputValue: {
      get() {
        return this.currentToken?.tokenId;
      },
      set: function (value) {
        this.$emit(
          "update:currentToken",
          this.tokenData.find((p) => p.tokenId == value)
        );
        this.$emit("calculatorAmount");
      },
    },
  },
};
</script>

<style></style>
