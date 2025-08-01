---
title: Not 'A Very Humble Programmer'
date: 2025-06-26
author: Sanjay Yepuri
type: post
---

I recently came across Edgser Dijkstra’s “A Very Humble Programmer.” This lecture resonated greatly with me. The ideas he described felt obvious to me and aligned with axioms that I already knew. However, hearing him speak about it convinced me that others may want to hear my thoughts. Now, I concede that a Turing Award is not in my near future.

Fortunately for me, I am not a very humble programmer. In fact, some may say I am arrogant. Personally, I want to set my naive ideas into stone, and hope to find later on how silly they were. Or maybe I’ll receive a Turing Award...

One could dream.

## How I Build
There are only two skills required to build.
 - Knowing how to learn.
 - Understanding how to decompose large problems.

The knowledge of various languages, operating systems, algorithms, etc. is all in the pursuit of solving the problem. It is important to be good at these skills; they are what enable me to solve problems efficiently. However, they are not a prerequisite.  If you are good at learning, and can break a problem into the correct subproblems, the rest will fall into place.

I do want to mention that deep programming knowledge has its own trappings. Dijkstra said it best: “The competent programmer is fully aware of the strictly limited size of his own skull; therefore he approaches the programming task in full humility, and among other things he avoids clever tricks like the plague.” My goal is to write radically simple programs which are understandable by both computers and humans alike. A program that non-programmers can understand is a dream.

Karpathy said in his latest lecture that there will be a new class of Creators rather than Programmers. Natural Language will come to dominate how we convey and build ideas; knowledge of the computer may become a thing of the past. It is in that regime where the ability to learn and adapt becomes paramount. The Humble Programmer will become the Humble Creator; The solutions we generate still need to be intellectually digestible. We cannot sustain a world where we prompt an Agent to overengineer solutions for us. Our ability to fact-check responses remains crucial. Therefore, the two essential skills for building are here to stay.

## How I Learn
There are no complex problems; if something seems difficult or hard to reason about, that just means my mental model regarding the problem is incorrect. The goal is to make complex ideas simple.

There are three main ways I approach this: Reading literature, talking to people who are experts, and finally just reading others' code.

I’ve written very little software for my domain of expertise: Computer Science. For most of my career, I have always written software that encodes behaviors of another domain. This required me to expand my knowledge and learn about the area in which I’m applying my expertise. I found the best way to do this was to read existing literature. My goal is to map out the various subtopics that exist so I know where to look for any details I need. At most, I spend a weekend skimming through a textbook.

A side effect is that I can then communicate with experts. They are the individuals that think about the problem domain day in and out. Ultimately, these experts are the users of the products I build and must find using them intuitive. Talking to them ensures that I am on the right track and have the correct assumptions regarding the problem. I frequently ask questions and mark-to-market my ideas.

Finally, I always find myself trying to find inspiration in other spaces. It is rare to discover a new class of problem; most of the time, the problem has been solved or there is a parallel problem with a solution. Even when I feel I discovered something novel, the solution is usually an iteration on a previously seen pattern. When I come across a relevant project, I start by understanding the project structure and documentation. Then, I look for the abstractions and try to reverse engineer the intention.

Taking these three steps, I can model problems with great accuracy. The abstractions create a “new semantic level” or language that can be composed to solve more complex problems in the domain. These problems and their solutions can now be expressed in the simplest terms.

## How I Decompose Problems
I approach writing code fairly mathematically. By this, I mean that I like the idea of building out primitives which I can reason about. I just need to prove the correctness once and have an understanding of the required assumptions. Then I can combine these primitives to assert more complex facts about the world. I found this approach works great across all domains: from building large distributed systems to the simplest scripts.

This leads to nicely factored solutions that generally can be reused. When a new variant appears, usually the code is generic to handle it automatically. If not, it usually requires specializing the existing operations that are already defined. This means that iterations or new features are quick to implement and can reuse the existing proofs of correctness or testing frameworks.

At the highest level of abstraction, the solution is easily digestible by less technical contributors. When I explain the solution, it should align with their existing understanding of the problem. Then, they can provide critical feedback which ensures we are aligned.

## Will AI Replace Me
Not yet. What I bring to the table is a principled approach to solve problems that span the globe. The AI tools we have today are just that: tools. They make me more efficient in learning and building solutions. However, as with AI art, code generated by LLMs rarely has sympathy for the human condition. This is the deeper understanding of the problem we are trying to solve and why. In the end, only one human can understand another human. However, I am open-minded. What a day it would be for humans to be completely understood by someone or something else.

## Programming with Humility
While I may not share Dijkstra's humble attitude, the principles I've outlined—the dual pillars of learning and decomposition, a commitment to intellectual clarity, and a forward-looking embrace of evolving creative paradigms—form the bedrock of my programming philosophy. These deeply ingrained ideas, though perhaps audacious in their scope, are what drive my lifelong pursuit of building and understanding the complex world around us.

Clearly, an AI generated that paragraph. The real conclusion is that I am not a humble programmer, but one that loves to dream.

If you somehow got this far, you must be wondering who I am. I think for the purpose of this essay, I’m just a passionate programmer who has been building their entire life. I would do this even if I was not paid (and I have). I want to build as many things as possible before my time is up. Not necessarily projects that are useful, but something I would look back on and think: I can’t believe I did that.
