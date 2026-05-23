<template>
  <div class="rule-edit" v-if="rule">
    <header class="header">
      <div class="header-content">
        <button class="icon-btn" @click="$router.back()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <h1>编辑规则</h1>
        <button class="icon-btn" @click="save">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
        </button>
      </div>
    </header>

    <div class="content">
      <div class="card">
        <h3 class="card-title">选择时间段</h3>
        <div class="time-row">
          <div class="time-box" @click="showStartPicker = true">
            <span class="time-label">开始时间</span>
            <span class="time-value">{{ startTime }}</span>
          </div>
          <div class="time-box" @click="showEndPicker = true">
            <span class="time-label">结束时间</span>
            <span class="time-value">{{ endTime }}</span>
          </div>
        </div>
      </div>

      <div class="card">
        <h3 class="card-title">基础计费</h3>
        <div class="input-group">
          <label>起步价 (¥)</label>
          <input type="number" inputmode="decimal" v-model="form.baseFare" />
        </div>
        <div class="input-group">
          <label>起步里程 (公里)</label>
          <input type="number" inputmode="decimal" v-model="form.baseDistance" />
        </div>
        <div class="input-group">
          <label>单价 (¥/公里)</label>
          <input type="number" inputmode="decimal" v-model="form.unitPrice" />
        </div>
      </div>

      <div class="card">
        <h3 class="card-title">远途费设置</h3>
        <div class="input-group">
          <label>起算里程 (公里)</label>
          <input type="number" inputmode="decimal" v-model="form.longDistanceThreshold" />
        </div>
        <div class="input-group">
          <label>附加费 (¥/公里)</label>
          <input type="number" inputmode="decimal" v-model="form.longDistanceSurcharge" />
        </div>
        <div class="input-group">
          <label>封顶金额 (¥)</label>
          <input type="number" inputmode="decimal" v-model="form.longDistanceCap" />
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showStartPicker" class="modal-overlay" @click.self="showStartPicker = false">
        <div class="picker-modal">
          <h3>选择开始时间</h3>
          <div class="picker-row">
            <select v-model="startH">
              <option v-for="h in 24" :key="h-1" :value="h-1">{{ String(h-1).padStart(2, '0') }}</option>
            </select>
            <span class="picker-sep">:</span>
            <select v-model="startM">
              <option v-for="m in 60" :key="m-1" :value="m-1">{{ String(m-1).padStart(2, '0') }}</option>
            </select>
          </div>
          <div class="modal-actions">
            <button class="btn-text" @click="showStartPicker = false">取消</button>
            <button class="btn-primary" @click="applyStartTime">确定</button>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="showEndPicker" class="modal-overlay" @click.self="showEndPicker = false">
        <div class="picker-modal">
          <h3>选择结束时间</h3>
          <div class="picker-row">
            <select v-model="endH">
              <option v-for="h in 24" :key="h-1" :value="h-1">{{ String(h-1).padStart(2, '0') }}</option>
            </select>
            <span class="picker-sep">:</span>
            <select v-model="endM">
              <option v-for="m in 60" :key="m-1" :value="m-1">{{ String(m-1).padStart(2, '0') }}</option>
            </select>
          </div>
          <div class="modal-actions">
            <button class="btn-text" @click="showEndPicker = false">取消</button>
            <button class="btn-primary" @click="applyEndTime">确定</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useFareStore } from '../stores/fare'

const props = defineProps({ templateId: String, ruleId: String })
const store = useFareStore()
const router = useRouter()

const template = computed(() => store.templates.find(t => t.id === props.templateId))
const rule = computed(() => template.value?.rules.find(r => r.id === props.ruleId))

const form = reactive({
  baseFare: rule.value?.baseFare ?? 22,
  baseDistance: rule.value?.baseDistance ?? 5,
  unitPrice: rule.value?.unitPrice ?? 4.5,
  longDistanceThreshold: rule.value?.longDistanceThreshold ?? 30,
  longDistanceSurcharge: rule.value?.longDistanceSurcharge ?? 1,
  longDistanceCap: rule.value?.longDistanceCap ?? 200,
})

const timeParts = computed(() => (rule.value?.name || '07:00-19:59').split('-'))
const startTime = computed(() => timeParts.value[0] || '07:00')
const endTime = computed(() => timeParts.value[1] || '19:59')

const showStartPicker = ref(false)
const showEndPicker = ref(false)

const startH = ref(parseInt(startTime.value.split(':')[0]))
const startM = ref(parseInt(startTime.value.split(':')[1]))
const endH = ref(parseInt(endTime.value.split(':')[0]))
const endM = ref(parseInt(endTime.value.split(':')[1]))

function pad(n) { return String(n).padStart(2, '0') }

function applyStartTime() {
  showStartPicker.value = false
  updateName(`${pad(startH.value)}:${pad(startM.value)}-${endTime.value}`)
}

function applyEndTime() {
  showEndPicker.value = false
  updateName(`${startTime.value}-${pad(endH.value)}:${pad(endM.value)}`)
}

function updateName(newName) {
  store.updateRule(props.templateId, {
    ...rule.value,
    name: newName,
  })
}

function save() {
  store.updateRule(props.templateId, {
    ...rule.value,
    baseFare: parseFloat(form.baseFare) || 0,
    baseDistance: parseFloat(form.baseDistance) || 0,
    unitPrice: parseFloat(form.unitPrice) || 0,
    longDistanceThreshold: parseFloat(form.longDistanceThreshold) || 0,
    longDistanceSurcharge: parseFloat(form.longDistanceSurcharge) || 0,
    longDistanceCap: parseFloat(form.longDistanceCap) || 0,
  })
  router.back()
}
</script>

<style scoped>
.rule-edit {
  min-height: 100dvh;
  background: var(--background);
  padding-bottom: var(--safe-bottom);
}

.header {
  background: var(--primary);
  color: #fff;
  padding: calc(12px + var(--safe-top)) 8px 12px;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-content h1 {
  font-size: 18px;
  font-weight: 600;
}

.icon-btn {
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn:active {
  background: rgba(255, 255, 255, 0.2);
}

.content {
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card {
  background: var(--surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 20px;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--primary);
  margin-bottom: 16px;
}

.time-row {
  display: flex;
  gap: 12px;
}

.time-box {
  flex: 1;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 14px;
  cursor: pointer;
  text-align: center;
  transition: border-color 0.2s;
}

.time-box:active {
  border-color: var(--primary);
}

.time-label {
  display: block;
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.time-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--on-surface);
}

.input-group {
  margin-bottom: 16px;
}

.input-group:last-child {
  margin-bottom: 0;
}

.input-group label {
  display: block;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.input-group input {
  width: 100%;
  padding: 12px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 15px;
  outline: none;
}

.input-group input:focus {
  border-color: var(--primary);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
}

.picker-modal {
  background: var(--surface);
  border-radius: var(--radius);
  padding: 24px;
  width: 100%;
  max-width: 320px;
  box-shadow: var(--shadow-lg);
}

.picker-modal h3 {
  font-size: 16px;
  margin-bottom: 20px;
  text-align: center;
}

.picker-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 24px;
}

.picker-row select {
  padding: 10px 16px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 24px;
  font-weight: 600;
  background: var(--surface);
  cursor: pointer;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  text-align: center;
  min-width: 64px;
}

.picker-row select:focus {
  border-color: var(--primary);
}

.picker-sep {
  font-size: 24px;
  font-weight: 700;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn-text {
  background: none;
  border: none;
  color: var(--text-secondary);
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  border-radius: var(--radius-sm);
}

.btn-primary {
  background: var(--primary);
  color: #fff;
  border: none;
  padding: 8px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border-radius: var(--radius-sm);
}
</style>
