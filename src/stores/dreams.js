import { reactive } from 'vue'
import { loadData, saveData } from '@/utils/storage.js'
import defaultTrees from '@/data/dream-garden.json'

const STORAGE_KEY = 'dream_trees'

export const dreamState = reactive({
  trees: loadData(STORAGE_KEY, defaultTrees)
})

export function addTree(style = 'fairy_town') {
  const newTree = {
    id: 'tree_' + Date.now(),
    style,
    root: {
      id: 'node_' + Date.now(),
      type: 'leaf',
      content: '新灵感',
      createdAt: new Date().toISOString(),
      children: []
    }
  }
  dreamState.trees.push(newTree)
  persist()
  return newTree
}

export function addChildNode(treeId, parentNodeId, content, type = 'branch') {
  const tree = dreamState.trees.find(t => t.id === treeId)
  if (!tree) return null

  const newNode = {
    id: 'node_' + Date.now(),
    type,
    content,
    createdAt: new Date().toISOString(),
    children: []
  }

  function findAndAdd(node) {
    if (node.id === parentNodeId) {
      node.children.push(newNode)
      return true
    }
    if (node.children) {
      return node.children.some(c => findAndAdd(c))
    }
    return false
  }

  findAndAdd(tree.root)
  persist()
  return newNode
}

export function updateNode(treeId, nodeId, updates) {
  const tree = dreamState.trees.find(t => t.id === treeId)
  if (!tree) return

  function findAndUpdate(node) {
    if (node.id === nodeId) {
      Object.assign(node, updates)
      return true
    }
    if (node.children) {
      return node.children.some(c => findAndUpdate(c))
    }
    return false
  }

  findAndUpdate(tree.root)
  persist()
}

export function deleteNode(treeId, nodeId) {
  const tree = dreamState.trees.find(t => t.id === treeId)
  if (!tree) return

  function removeFrom(arr) {
    const idx = arr.findIndex(c => c.id === nodeId)
    if (idx >= 0) {
      arr.splice(idx, 1)
      return true
    }
    return arr.some(c => c.children && removeFrom(c.children))
  }

  if (tree.root.id === nodeId) {
    dreamState.trees = dreamState.trees.filter(t => t.id !== treeId)
  } else {
    removeFrom(tree.root.children ? [tree.root] : [])
  }
  persist()
}

export function deleteTree(treeId) {
  dreamState.trees = dreamState.trees.filter(t => t.id !== treeId)
  persist()
}

function persist() {
  saveData(STORAGE_KEY, dreamState.trees)
}
