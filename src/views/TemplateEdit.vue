<template>
  <div class="template-edit" v-if="template">
    <header class="header">
      <div class="header-content">
        <button class="icon-btn" @click="handleBack">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <h1>{{ template.name }}</h1>
        <div style="width:40px"></div>
      </div>
    </header>

    <div class="content">
      <h2 class="section-title">通用设置</h2>

      <div class="card">
        <div class="input-group">
          <label>模板名称</label>
          <input
            type="text"
            :value="template.name"
            @input="store.updateTemplateName(props.id, $event.target.value)"
          />
        </div>

        <div class="slider-group">
          <div class="slider-header">
            <span>费率系数</span>
            <span class="slider-value">{{ (template.discount * 100).toFixed(0) }}%</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="2"
            step="0.01"
            :value="template.discount"
            @input="store.updateTemplateDiscount(props.id, parseFloat($event.target.value))"
          />
        </div>
      </div>

      <h2 class="section-title" style="margin-top: 24px;">计费规则</h2>

      <div
        v-for="rule in template.rules"
        :key="rule.id"
        class="rule-card"
        @click="$router.push('/template/' + props.id + '/rule/' + rule.id)"
      >
        <div class="rule-name">{{ rule.name }}</div>
        <div class="rule-detail">起步: ¥{{ rule.baseFare }} ({{ rule.baseDistance }}km) + ¥{{ rule.unitPrice }}/km</div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showWarning" class="modal-overlay" @click.self="showWarning = false">
        <div class="modal">
          <h3>时间段未全覆盖</h3>
          <p>设置的时间段未完全覆盖全天 (00:00 - 23:59)。是否仍要返回？</p>
          <div class="modal-actions">
            <button class="btn-text" @click="showWarning = false">取消</button>
            <button class="btn-primary" @click="showWarning = false; $router.back()">确定</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useFareStore } from '../stores/fare'

const props = defineProps({ id: String })
const store = useFareStore()
const router = useRouter()
const showWarning = ref(false)

const template = computed(() => store.templates.find(t => t.id === props.id))

function isCoverageComplete(rules) {
  if (!rules || rules.length === 0) return false
  const minutes = new Uint8Array(24 * 60)
  for (const rule of rules) {
    const parts = rule.name.split('-')
    if (parts.length !== 2) continue
    const [sh, sm] = parts[0].split(':').map(Number)
    const [eh, em] = parts[1].split(':').map(Number)
    const start = sh * 60 + sm
    const end = eh * 60 + em
    if (start <= end) {
      for (let i = start; i <= end && i < 1440; i++) minutes[i] = 1
    } else {
      for (let i = start; i < 1440; i++) minutes[i] = 1
      for (let i = 0; i <= end && i < 1440; i++) minutes[i] = 1
    }
  }
  return minutes.every(v => v === 1)
}

function handleBack() {
  if (!template.value || isCoverageComplete(template.value.rules)) {
    router.back()
  } else {
    showWarning.value = true
  }
}
</script>

<style scoped>
.template-edit {
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
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--primary);
}

.card {
  background: var(--surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 20px;
}

.input-group {
  margin-bottom: 20px;
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

.slider-group {
  margin-bottom: 0;
}

.slider-header {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.slider-value {
  font-weight: 600;
  color: var(--on-surface);
}

input[type="range"] {
  width: 100%;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: var(--border);
  border-radius: 2px;
  outline: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--primary);
  cursor: pointer;
}

.rule-card {
  background: var(--surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.rule-card:active {
  box-shadow: var(--shadow-lg);
}

.rule-name {
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 4px;
}

.rule-detail {
  font-size: 13px;
  color: var(--text-secondary);
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

.modal {
  background: var(--surface);
  border-radius: var(--radius);
  padding: 24px;
  width: 100%;
  max-width: 360px;
  box-shadow: var(--shadow-lg);
}

.modal h3 {
  font-size: 18px;
  margin-bottom: 12px;
}

.modal p {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 20px;
  line-height: 1.5;
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
