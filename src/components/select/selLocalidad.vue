<template>
    <select
        :value="modelValueNormalizado"
        @change="actualizarLocalidad"
    >
        <option value="">Todas</option>
        <option
            v-for="(item, k) in localidades"
            :key="k"
            :value="item.id"
        >
            {{ item.nombre }}
        </option>
    </select>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    modelValue: {
        type: [String, Number, null],
        default: ''
    },
    localidades: {
        type: Array,
        default: () => []
    }
})

const emit = defineEmits(['update:modelValue'])

const modelValueNormalizado = computed(() => props.modelValue ?? '')

const actualizarLocalidad = (event) => {
    emit('update:modelValue', event.target.value)
}
</script>
