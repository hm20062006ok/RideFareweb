<template>
  <div class="settings">
    <header class="header">
      <div class="header-content">
        <button class="icon-btn" @click="$router.back()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <h1>设置</h1>
        <button class="icon-btn" @click="showAdd = true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
        </button>
      </div>
    </header>

    <div class="content">
      <h2 class="section-title">计费模板</h2>

      <div
        v-for="tpl in store.templates"
        :key="tpl.id"
        :class="['template-card', { selected: tpl.id === store.selectedTemplateId }]"
      >
        <label class="template-radio" @click="store.selectTemplate(tpl.id)">
          <input type="radio" name="template" :checked="tpl.id === store.selectedTemplateId" />
          <span class="radio-custom"></span>
          <div class="template-info">
            <span class="template-name">{{ tpl.name }}</span>
            <span v-if="tpl.id === store.selectedTemplateId" class="template-badge">已选中</span>
          </div>
        </label>
        <div class="template-actions">
          <button class="icon-btn-sm" @click="$router.push('/template/' + tpl.id)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
          </button>
          <button class="icon-btn-sm danger" @click="handleDelete(tpl.id)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </button>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showAdd" class="modal-overlay" @click.self="showAdd = false">
        <div class="modal">
          <h3>添加模板</h3>
          <input
            v-model="newName"
            type="text"
            placeholder="模板名称"
            @keyup.enter="handleAdd"
          />
          <div class="modal-actions">
            <button class="btn-text" @click="showAdd = false">取消</button>
            <button class="btn-primary" @click="handleAdd" :disabled="!newName.trim()">添加</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useFareStore } from '../stores/fare'

const store = useFareStore()
const showAdd = ref(false)
const newName = ref('')

function handleAdd() {
  if (newName.value.trim()) {
    store.addTemplate(newName.value.trim())
    newName.value = ''
    showAdd.value = false
  }
}

function handleDelete(id) {
  if (store.templates.length <= 1) return
  if (confirm('确定删除此模板？')) {
    store.deleteTemplate(id)
  }
}
</script>

<style scoped>
.settings {
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
}

.template-card {
  background: var(--surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  padding: 14px 16px;
  transition: box-shadow 0.2s;
}

.template-card.selected {
  box-shadow: 0 0 0 2px var(--primary), var(--shadow);
}

.template-radio {
  display: flex;
  align-items: center;
  flex: 1;
  cursor: pointer;
  gap: 12px;
}

.template-radio input {
  display: none;
}

.radio-custom {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid var(--border);
  flex-shrink: 0;
  position: relative;
  transition: border-color 0.2s;
}

.template-card.selected .radio-custom {
  border-color: var(--primary);
}

.template-card.selected .radio-custom::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--primary);
}

.template-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.template-name {
  font-size: 15px;
  font-weight: 500;
}

.template-badge {
  font-size: 12px;
  color: var(--primary);
}

.template-actions {
  display: flex;
  gap: 4px;
}

.icon-btn-sm {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

.icon-btn-sm:active {
  background: rgba(0, 0, 0, 0.06);
}

.icon-btn-sm.danger {
  color: var(--error);
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
  margin-bottom: 16px;
}

.modal input {
  width: 100%;
  padding: 12px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 15px;
  outline: none;
  margin-bottom: 20px;
}

.modal input:focus {
  border-color: var(--primary);
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

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
