<template>
  <div class="siriusgraph-container">
    <svg ref="svgRef"></svg>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import * as d3 from 'd3'

const props = defineProps({ data: Object })
const svgRef = ref(null)

function renderGraph() {
  if (!svgRef.value || !props.data) return
  const svg = d3.select(svgRef.value)
  svg.selectAll('*').remove()

  const width = 1000, height = 620
  const center = { x: width / 2, y: height / 2 }
  svg.attr('viewBox', [0, 0, width, height])

  // glow filter
  const defs = svg.append('defs')
  const filter = defs.append('filter').attr('id', 'glow')
  filter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'coloredBlur')
  const merge = filter.append('feMerge')
  merge.append('feMergeNode').attr('in', 'coloredBlur')
  merge.append('feMergeNode').attr('in', 'SourceGraphic')

  const sirius = { id: 'sirius', label: '天狼星', fixed: true, fx: center.x, fy: center.y, size: 50, category: 'core', locked: false }
  const nodes = [sirius, ...props.data.nodes.map(n => ({ ...n }))]
  const links = props.data.links.map(l => ({ ...l }))

  const simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.id).distance(140))
    .force('charge', d3.forceManyBody().strength(-350))
    .force('center', d3.forceCenter(center.x, center.y))
    .force('x', d3.forceX(center.x).strength(0.04))
    .force('y', d3.forceY(center.y).strength(0.04))
    .force('collide', d3.forceCollide().radius(d => (d.size || 20) + 12))

  // links
  const link = svg.append('g')
    .selectAll('line')
    .data(links)
    .join('line')
    .attr('stroke', '#7c3aed')
    .attr('stroke-opacity', 0.4)
    .attr('stroke-width', 1.5)

  // link labels
  const linkLabel = svg.append('g')
    .selectAll('text')
    .data(links)
    .join('text')
    .text(d => d.label || '')
    .attr('font-size', '10')
    .attr('fill', '#a78bfa')
    .attr('text-anchor', 'middle')
    .attr('opacity', 0.7)

  // nodes
  const node = svg.append('g')
    .selectAll('g')
    .data(nodes)
    .join('g')
    .attr('cursor', 'grab')

  node.append('circle')
    .attr('r', d => d.size || 20)
    .attr('fill', d => {
      if (d.id === 'sirius') return '#fbbf24'
      if (d.locked && !d.id === 'sirius') return '#555'
      return '#a78bfa'
    })
    .attr('opacity', 0.9)
    .attr('filter', 'url(#glow)')

  // lock icon for locked nodes
  node.filter(d => d.locked && d.id !== 'sirius')
    .append('text')
    .text('🔒')
    .attr('font-size', '11')
    .attr('text-anchor', 'middle')
    .attr('dy', '4')

  // labels
  node.append('text')
    .text(d => d.label)
    .attr('dy', d => (d.size || 20) + 14)
    .attr('text-anchor', 'middle')
    .attr('fill', '#e9d5ff')
    .attr('font-size', '11')
    .attr('font-family', 'Orbitron, Exo 2, sans-serif')

  // star particles background
  for (let i = 0; i < 80; i++) {
    svg.append('circle')
      .attr('cx', Math.random() * width)
      .attr('cy', Math.random() * height)
      .attr('r', Math.random() * 1.5 + 0.5)
      .attr('fill', '#fff')
      .attr('opacity', Math.random() * 0.6 + 0.2)
  }

  // drag
  node.call(d3.drag()
    .on('start', (event, d) => {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      d.fx = d.x; d.fy = d.y
    })
    .on('drag', (event, d) => {
      d.fx = event.x; d.fy = event.y
    })
    .on('end', (event, d) => {
      if (!event.active) simulation.alphaTarget(0)
      if (d.id !== 'sirius') { d.fx = null; d.fy = null }
    })
  )

  simulation.on('tick', () => {
    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y)
    linkLabel
      .attr('x', d => (d.source.x + d.target.x) / 2)
      .attr('y', d => (d.source.y + d.target.y) / 2)
    node.attr('transform', d => `translate(${d.x},${d.y})`)
  })
}

watch(() => props.data, () => renderGraph(), { deep: true })
onMounted(() => renderGraph())
</script>

<style scoped>
.siriusgraph-container svg {
  width: 100%;
  height: auto;
  min-height: 560px;
  background: radial-gradient(ellipse at center, #0a0a28 0%, #050510 70%);
  border-radius: 8px;
  border: 1px solid var(--border);
}
</style>
