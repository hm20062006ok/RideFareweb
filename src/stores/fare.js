import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { uuid } from '../utils/id'
import { calculateFare, getDefaultRuleIndex } from '../utils/fareCalculator'

const STORAGE_KEY = 'ride_fare_templates'
const SELECTED_KEY = 'ride_fare_selected_template'

function loadTemplates() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

function saveTemplates(templates) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates))
}

function loadSelectedId() {
  return localStorage.getItem(SELECTED_KEY) || ''
}

function saveSelectedId(id) {
  localStorage.setItem(SELECTED_KEY, id)
}

function createDefaultTemplates() {
  const defaultRules = [
    { id: uuid(), name: '07:00-19:59', baseFare: 22, baseDistance: 5, unitPrice: 4.5, longDistanceThreshold: 30, longDistanceSurcharge: 1, longDistanceCap: 200 },
    { id: uuid(), name: '20:00-23:59', baseFare: 25, baseDistance: 5, unitPrice: 4.5, longDistanceThreshold: 30, longDistanceSurcharge: 1, longDistanceCap: 200 },
    { id: uuid(), name: '00:00-06:59', baseFare: 39, baseDistance: 5, unitPrice: 4.5, longDistanceThreshold: 30, longDistanceSurcharge: 1, longDistanceCap: 200 },
  ]
  return [{ id: uuid(), name: '默认模板', rules: defaultRules, discount: 1.0 }]
}

export const useFareStore = defineStore('fare', () => {
  const templates = ref(loadTemplates() || createDefaultTemplates())
  const selectedTemplateId = ref(loadSelectedId() || templates.value[0]?.id || '')
  const selectedRuleIndex = ref(getDefaultRuleIndex())
  const inputDistance = ref('')
  const isDiscountEnabled = ref(false)

  const currentTemplate = computed(() =>
    templates.value.find((t) => t.id === selectedTemplateId.value) || templates.value[0] || null
  )

  const fareResult = computed(() => {
    const dist = parseFloat(inputDistance.value)
    const tpl = currentTemplate.value
    if (!tpl || isNaN(dist) || selectedRuleIndex.value >= tpl.rules.length) return null
    const rule = tpl.rules[selectedRuleIndex.value]
    const discount = isDiscountEnabled.value ? tpl.discount : 1.0
    return calculateFare(dist, rule, discount)
  })

  function selectRule(index) {
    selectedRuleIndex.value = index
  }

  function updateDistance(val) {
    inputDistance.value = val
  }

  function toggleDiscount() {
    isDiscountEnabled.value = !isDiscountEnabled.value
  }

  function selectTemplate(id) {
    selectedTemplateId.value = id
    saveSelectedId(id)
    selectedRuleIndex.value = getDefaultRuleIndex()
    isDiscountEnabled.value = false
  }

  function persist() {
    saveTemplates(templates.value)
  }

  function addTemplate(name) {
    const defaultRules = [
      { id: uuid(), name: '07:00-19:59', baseFare: 22, baseDistance: 5, unitPrice: 4.5, longDistanceThreshold: 30, longDistanceSurcharge: 1, longDistanceCap: 200 },
      { id: uuid(), name: '20:00-23:59', baseFare: 25, baseDistance: 5, unitPrice: 4.5, longDistanceThreshold: 30, longDistanceSurcharge: 1, longDistanceCap: 200 },
      { id: uuid(), name: '00:00-06:59', baseFare: 39, baseDistance: 5, unitPrice: 4.5, longDistanceThreshold: 30, longDistanceSurcharge: 1, longDistanceCap: 200 },
    ]
    templates.value.push({ id: uuid(), name, rules: defaultRules, discount: 1.0 })
    persist()
  }

  function updateTemplateName(templateId, newName) {
    const tpl = templates.value.find((t) => t.id === templateId)
    if (tpl) {
      tpl.name = newName
      persist()
    }
  }

  function updateTemplateDiscount(templateId, newDiscount) {
    const tpl = templates.value.find((t) => t.id === templateId)
    if (tpl) {
      tpl.discount = newDiscount
      persist()
    }
  }

  function updateRule(templateId, updatedRule) {
    const tpl = templates.value.find((t) => t.id === templateId)
    if (tpl) {
      const idx = tpl.rules.findIndex((r) => r.id === updatedRule.id)
      if (idx !== -1) {
        tpl.rules[idx] = updatedRule
        persist()
      }
    }
  }

  function deleteTemplate(id) {
    if (templates.value.length <= 1) return
    templates.value = templates.value.filter((t) => t.id !== id)
    if (selectedTemplateId.value === id) {
      selectedTemplateId.value = templates.value[0]?.id || ''
      saveSelectedId(selectedTemplateId.value)
    }
    persist()
  }

  return {
    templates,
    selectedTemplateId,
    selectedRuleIndex,
    inputDistance,
    isDiscountEnabled,
    currentTemplate,
    fareResult,
    selectRule,
    updateDistance,
    toggleDiscount,
    selectTemplate,
    addTemplate,
    updateTemplateName,
    updateTemplateDiscount,
    updateRule,
    deleteTemplate,
  }
})
