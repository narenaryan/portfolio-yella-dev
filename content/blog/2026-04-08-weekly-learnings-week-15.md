+++
title = "Things I Learnt This Week (Week 15 of 2026): Mental Models, AI Agent Security, Future of Work, Flat Orgs"
slug = "weekly-learnings-week-15-2026"
date = "2026-04-08"

[extra]
card_image = "/card-images/blog/weekly-learnings-week-15-2026.webp"
card_image_alt = "Rain falling over the Denver skyline"
+++
<img width="1600" height="900" src="https://d3bphourhbt2ew.cloudfront.net/images/denver_rain.jpg" alt="Rain falling over the Denver skyline" />

A few things I read this week that were worth slowing down for.

---

## Mental Models: The 80/20 of Clear Thinking

James Clear's [piece on mental models](https://jamesclear.com/mental-models) is a good reminder that you don't need to master every domain to think well. Mental models are simplified frameworks for how things work — and the insight is that a small set of them (he says 80–90) can carry the weight of most real decisions. Breadth across the right models gives you portable reasoning that transfers across domains. The goal isn't memorizing them but building intuitions you can reach for quickly.

---

## The Lethal Trifecta for AI Agents

Simon Willison's [post](https://simonw.substack.com/p/the-lethal-trifecta-for-ai-agents) names a security pattern that should be front of mind for anyone building agentic systems. The dangerous combination is: **private data access + untrusted content exposure + the ability to communicate externally**. When all three exist in a single agent, an attacker only needs to plant instructions in content the agent reads — an email, a document, a web page — to cause it to leak sensitive data. The fix is architectural: once an agent has ingested untrusted input, it must be structurally prevented from taking consequential external actions. Not a prompt engineering problem. A system design problem.

This connects directly to the work I've been doing on multi-agent pipelines. The more capable an agent is, the more carefully you need to partition what it can see from what it can do.

---

## The Future of Work Is Playing a Video Game

Rohit Krishnan's [essay](https://www.strangeloopcanon.com/p/the-future-of-work-is-playing-a-videogame) reframes what AI-augmented work actually looks like at scale. As agents handle more specialized execution, human roles will start to look like real-time strategy games — monitoring fleets, reading dashboards and logs, context-switching fast, and stepping in at the right moments rather than doing the work end-to-end. The individual contributor title survives, but the job becomes orchestration.

What struck me here is that this demands a very different skill set. Deep expertise in one domain matters less. Breadth, speed of judgment, and the ability to hold context across parallel workstreams matters more.

---

## From Hierarchy to Intelligence

Block's [internal essay](https://block.xyz/inside/from-hierarchy-to-intelligence) makes the case that traditional org hierarchies exist largely as information routing systems — work flows up and down because that's how decisions get made and context gets shared. AI breaks this assumption. If a system can maintain a continuously updated model of your entire business, you don't need management layers to relay information. Their proposal: organize around capabilities, world models, and an intelligence layer — with humans at the edges, handling judgment calls and ethical decisions the system can't yet navigate.

The underlying claim is sound. Hierarchies exist because humans have limited bandwidth. Agents don't. That asymmetry changes what the optimal org structure looks like.

---

## References

- [Mental Models: How to Train Your Brain to Think in New Ways — James Clear](https://jamesclear.com/mental-models)
- [The Lethal Trifecta for AI Agents — Simon Willison](https://simonw.substack.com/p/the-lethal-trifecta-for-ai-agents)
- [The Future of Work Is Playing a Videogame — Strange Loop Canon](https://www.strangeloopcanon.com/p/the-future-of-work-is-playing-a-videogame)
- [From Hierarchy to Intelligence — Block](https://block.xyz/inside/from-hierarchy-to-intelligence)
