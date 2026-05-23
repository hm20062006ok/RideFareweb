<template>
  <div class="home">
    <header class="header">
      <div class="header-content">
        <div class="header-title">
          <h1>代驾计算器</h1>
          <span class="template-name">{{ store.currentTemplate?.name }}</span>
        </div>
        <button class="icon-btn" @click="$router.push('/settings')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
      </div>
    </header>

    <div class="tabs" v-if="store.currentTemplate?.rules?.length">
      <button
        v-for="(rule, i) in store.currentTemplate.rules"
        :key="rule.id"
        :class="['tab', { active: store.selectedRuleIndex === i }]"
        @click="store.selectRule(i)"
      >{{ rule.name }}</button>
    </div>

    <div class="content">
      <div class="input-card">
        <div class="input-group">
          <label>里程 (公里)</label>
          <input
            type="number"
            inputmode="decimal"
            :value="store.inputDistance"
            @input="store.updateDistance($event.target.value)"
            placeholder="请输入里程"
          />
        </div>
        <button
          :class="['rate-btn', { active: store.isDiscountEnabled }]"
          @click="store.toggleDiscount()"
        >{{ store.isDiscountEnabled ? '取消打折' : '打折' }}</button>
      </div>

      <div v-if="store.fareResult" class="result-card">
        <div class="result-header">
          <span class="result-label">预估总价</span>
          <span class="result-price">¥{{ formatPrice(store.fareResult.finalPrice) }}</span>
        </div>

        <button class="detail-toggle" @click="expanded = !expanded">
          {{ expanded ? '收起明细' : '查看明细' }}
        </button>

        <div v-if="expanded" class="details">
          <div class="detail-row">
            <div class="detail-info">
              <span class="detail-label">起步价</span>
            </div>
            <span class="detail-value">¥{{ formatPrice(store.fareResult.baseFare) }}</span>
          </div>

          <div class="detail-row">
            <div class="detail-info">
              <span class="detail-label">里程费</span>
              <span class="detail-sub">{{ formatNum(store.fareResult.extraDistance) }} × {{ formatNum(store.fareResult.unitPrice) }}</span>
            </div>
            <span class="detail-value">¥{{ formatPrice(store.fareResult.distanceCost) }}</span>
          </div>

          <div v-if="store.fareResult.longDistanceCost > 0" class="detail-row">
            <div class="detail-info">
              <span class="detail-label">远途费</span>
              <span class="detail-sub">{{ formatNum(store.fareResult.longDistance) }} × {{ formatNum(store.fareResult.longDistanceSurcharge) }}</span>
            </div>
            <span class="detail-value">¥{{ formatPrice(store.fareResult.longDistanceCost) }}</span>
          </div>

          <template v-if="store.fareResult.discount !== 1">
            <div class="detail-divider"></div>
            <div class="detail-row">
              <div class="detail-info">
                <span class="detail-label">{{ store.fareResult.discount < 1 ? '折扣已应用' : '加价已应用' }}</span>
                <span class="detail-sub">费率: {{ (store.fareResult.discount * 100).toFixed(0) }}%</span>
              </div>
              <span :class="['detail-value', store.fareResult.discount < 1 ? 'discount' : 'surcharge']">
                {{ discountDiff }}
              </span>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useFareStore } from '../stores/fare'

const store = useFareStore()
const expanded = ref(true)

function formatPrice(v) {
  return v.toFixed(2)
}

function formatNum(v) {
  return Number.isInteger(v) ? v.toString() : v.toFixed(1)
}

const discountDiff = computed(() => {
  if (!store.fareResult) return ''
  const original = store.fareResult.finalPrice / store.fareResult.discount
  const diff = store.fareResult.finalPrice - original
  return (diff > 0 ? '+' : '') + '¥' + diff.toFixed(2)
})
</script>

<style scoped>
.home {
  padding-bottom: var(--safe-bottom);
}

.header {
  background: var(--primary);
  color: #fff;
  padding: calc(16px + var(--safe-top)) 16px 16px;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-title h1 {
  font-size: 20px;
  font-weight: 700;
}

.template-name {
  font-size: 12px;
  opacity: 0.8;
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

.tabs {
  display: flex;
  background: var(--primary);
  padding: 0 8px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.tabs::-webkit-scrollbar {
  display: none;
}

.tab {
  flex-shrink: 0;
  padding: 10px 16px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  white-space: nowrap;
  transition: all 0.2s;
}

.tab.active {
  color: #fff;
  border-bottom-color: #fff;
  font-weight: 600;
}

.content {
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-card {
  background: var(--surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 20px;
}

.input-group {
  margin-bottom: 16px;
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
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;
  background: var(--surface);
}

.input-group input:focus {
  border-color: var(--primary);
}

.rate-btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  background: var(--primary);
  color: #fff;
  transition: background 0.2s;
}

.rate-btn.active {
  background: var(--primary-dark);
}

.rate-btn:active {
  opacity: 0.9;
}

.result-card {
  background: var(--primary-light);
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
  padding: 24px 20px;
}

.result-header {
  text-align: center;
  margin-bottom: 12px;
}

.result-label {
  display: block;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.result-price {
  font-size: 42px;
  font-weight: 800;
  color: var(--on-surface);
}

.detail-toggle {
  display: block;
  margin: 0 auto 16px;
  padding: 6px 20px;
  background: rgba(0, 0, 0, 0.06);
  border: none;
  border-radius: 20px;
  font-size: 13px;
  color: var(--on-surface);
  cursor: pointer;
}

.detail-toggle:active {
  background: rgba(0, 0, 0, 0.1);
}

.details {
  background: rgba(255, 255, 255, 0.5);
  border-radius: var(--radius-sm);
  padding: 12px 16px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.detail-info {
  display: flex;
  flex-direction: column;
}

.detail-label {
  font-size: 14px;
  color: var(--on-surface);
}

.detail-sub {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.detail-value {
  font-size: 15px;
  font-weight: 600;
  color: var(--on-surface);
}

.detail-value.discount {
  color: var(--success);
}

.detail-value.surcharge {
  color: var(--error);
}

.detail-divider {
  height: 1px;
  background: var(--border);
  margin: 4px 0;
}
</style>
