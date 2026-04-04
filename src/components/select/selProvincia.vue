<template>
    <select
        :value="modelValueNormalizado"
        @change="actualizarProvincia"
    >
        <option value="">Todas</option>
        <option
            v-for="(item, k) in provincias"
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
    provincias: {
        type: Array,
        default: () => []
    }
})

const emit = defineEmits(['update:modelValue', 'actualizar-provincia'])

const modelValueNormalizado = computed(() => props.modelValue ?? '')

const actualizarProvincia = (event) => {
    const valor = event.target.value
    emit('update:modelValue', valor)
    emit('actualizar-provincia', valor)
}
</script>
