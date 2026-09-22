<template>
  <div class="dreamtree-container">
    <svg ref="svgRef"></svg>
    <div v-if="isAdmin()" class="node-editor" v-show="editNode">
      <input v-model="editNode.content" placeholder="编辑内容…" />
      <div class="editor-actions">
        <button @click="saveEdit">保存</button>
        <button @click="addChild">添加子节点</button>
        <button class="btn-del" @click="deleteThis">删除</button>
        <button @click="editNode = null">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import * as d3 from 'd3'
import { isAdmin } from '@/stores/auth.js'
import { addChildNode, updateNode, deleteNode } from '@/stores/dreams.js'

const props = defineProps({ tree: Object })
const svgRef = ref(null)
const editNode = ref(null)

let currentData = null

function renderTree() {
  if (!svgRef.value) return
  const svg = d3.select(svgRef.value)
  svg.selectAll('*').remove()

  const width = 900, height = 520
  const margin = { top: 20, right: 60, bottom: 20, left: 60 }
  svg.attr('viewBox', [0, 0, width, height])

  const root = d3.hierarchy(cloneNode(props.tree.root))
  currentData = root

  const treeLayout = d3.tree().size([height - margin.top - margin.bottom, width - margin.left - margin.right])
  treeLayout(root)

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

  // links
  g.selectAll('path.link')
    .data(root.links())
    .join('path')
    .attr('class', 'link')
    .attr('d', d3.linkHorizontal().x(d => d.y).y(d => d.x))
    .attr('fill', 'none')
    .attr('stroke', 'var(--border, #e0c9a6)')
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', '4 3')

  // nodes
  const node = g.selectAll('g.node')
    .data(root.descendants())
    .join('g')
    .attr('class', 'node')
    .attr('transform', d => `translate(${d.y},${d.x})`)
    .on('click', (event, d) => {
      event.stopPropagation()
      if (d.children && d.children.length > 0) {
        d._children = d.children
        d.children = null
      } else if (d._children) {
        d.children = d._children
        d._children = null
      }
      renderTree()
    })
    .on('dblclick', (event, d) => {
      event.stopPropagation()
      if (isAdmin()) {
        editNode.value = { id: d.data.id, content: d.data.content, treeId: props.tree.id }
        // 阻止冒泡导致的 collapse
        event.preventDefault()
      }
    })

  // leaf or branch shape
  node.each(function (d) {
    const el = d3.select(this)
    if (d.data.type === 'leaf') {
      el.append('path')
        .attr('d', 'M0,-10 Q5,-10 8,-3 Q10,2 8,8 Q5,12 0,10 Q-5,12 -8,8 Q-10,2 -8,-3 Q-5,-10 0,-10 Z')
        .attr('fill', '#81b29a')
        .attr('stroke', '#5a9275')
        .attr('stroke-width', 1)
    } else {
      el.append('circle')
        .attr('r', 8)
        .attr('fill', '#e07a5f')
        .attr('stroke', '#c06040')
        .attr('stroke-width', 1)
    }
  })

  // labels
  node.append('text')
    .attr('dy', '0.31em')
    .attr('x', d => d.children || d._children ? -16 : 16)
    .attr('text-anchor', d => d.children || d._children ? 'end' : 'start')
    .text(d => d.data.content.slice(0, 22) + (d.data.content.length > 22 ? '…' : ''))
    .style('font-size', '12px')
    .style('fill', '#3d405b')
    .style('font-family', 'Nunito, sans-serif')
}

function cloneNode(node) {
  return {
    id: node.id,
    type: node.type,
    content: node.content,
    createdAt: node.createdAt,
    children: (node.children || []).map(c => cloneNode(c))
  }
}

function saveEdit() {
  if (editNode.value) {
    updateNode(props.tree.id, editNode.value.id, { content: editNode.value.content })
    editNode.value = null
    renderTree()
  }
}

function addChild() {
  if (editNode.value) {
    addChildNode(props.tree.id, editNode.value.id, '新延伸', 'branch')
    editNode.value = null
    renderTree()
  }
}

function deleteThis() {
  if (editNode.value) {
    deleteNode(props.tree.id, editNode.value.id)
    editNode.value = null
    renderTree()
  }
}

watch(() => props.tree, () => renderTree(), { deep: true })
onMounted(() => renderTree())
onUnmounted(() => {})
</script>

<style scoped>
.dreamtree-container {
  position: relative;
}
.dreamtree-container svg {
  width: 100%;
  height: auto;
  min-height: 480px;
  background: var(--bg-primary);
  border-radius: 8px;
}
.node-editor {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 12px 16px;
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}
.node-editor input {
  padding: 6px 10px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 13px;
  min-width: 200px;
}
.editor-actions {
  display: flex;
  gap: 6px;
}
.editor-actions button {
  padding: 4px 10px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 12px;
}
.btn-del { color: var(--danger); border-color: var(--danger); }
</style>
