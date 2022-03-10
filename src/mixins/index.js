import Vue from 'vue';

Vue.mixin({
    methods: {
        pickRandomFromArray(arr) {
            let result;
            let count = 0;
            for (let prop of arr)
                if (Math.random() < 1 / ++count) result = prop;
            return result || {};
        },
        isInteger(value) {
            let result = false;
            if (Number.isInteger(parseInt(value))) {
                result = true;
            }
            return result;
        },
    }
});