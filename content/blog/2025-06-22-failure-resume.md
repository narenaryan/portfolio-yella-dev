+++
title = "My Failure Resume"
slug = "failure-resume"
+++

<img style="width: 100vw;" src="https://d3bphourhbt2ew.cloudfront.net/images/baybridge_bw.jpg" />

A resume typically showcases successful projects and achievements. A failure resume does the opposite — it lists failures to show the battle scars from software engineering. Software engineering isn’t for the faint of heart, and I’ve had my fair share of failures over the past decade.

I am writing this to show others that I am like any other human. Many times, people assume that I do things with elegance and ease and achieve success.

Right from school, I have met many smart people who are smarter than me in magnitudes. It is a disservice to life and those people not to speak of my failures and show to be on par with them in success.

One thing is for sure. I valued curiosity, problem-solving & networking from the beginning of my career. Those qualities helped me overcome my shortcomings.

This article presents some of those failures I encountered at work, and how I overcame them. This is an honest self-critique, shared publicly to break free from my bubble of success.

## <ul>Failure 1</ul> Spend too much time learning on the job

At the beginning of my career, I wasn’t a quick learner. In the teams I was part of, there were amazing and fearless learners. Even my doing skill has a few shortcomings in comparison to them. I was strong in theory but weak in practice.

This weakness forced me to spend considerable time learning on the job. While it’s expected for beginners to learn as they go, my pace didn’t meet expectations. There is no shame in saying I was lagging.

It took 2–3 years to assess and improve my skills and understand what I could and couldn’t deliver. There are a few things that helped me to improve myself. I will present them now.

<b>What Helped Me?</b>

There are a few initiatives that helped me improve in that phase:

- <i>Maintaining a journal</i>
- <i>Repeating the patterns used by seniors</i>
- <i>Constantly reviewing myself & setting goals</i>

## <ul>Failure 2</ul> Spend too much time doing the job

There were times when my tasks slipped through multiple sprints, likely because I blindly accepted poorly estimated tasks and didn’t ask questions during backlog grooming sessions.

I mistakenly believed our backlog was meticulously groomed and that completing tasks was simply a matter of time. As you predicted, I was wrong.

Beyond inaccurate estimations, I overlooked tasks that required additional communication with other teams. This wasted valuable sprint time because I had to find information myself that a team member might already have known.

<b>>What Helped Me?</b>

There are a couple of things that assisted me in getting better here:

Step out of my comfort zone and ask the right questions
Put extra thought at the beginning of the task
After making those tweaks, I saw a significant boost in my velocity.


### <ul>Failure 3</ul> Release code without testing it thoroughly

Like many software developers, I had a lazy habit of assuming things would work when I made small code changes. I was wrong 90% of the time.

How did that happen? I used to unconsciously skip manual testing of code and system functionality. I learned the hard way that making tiny changes to a massive codebase can cause unpredictable regressions, making it essential to test every change before shipping software. End-to-end testing can still break because systems work charms in isolation, but when integrated they fall like ninepins.

<b>>What Helped Me?</b>
Knowing that systems always need additional testing after changes, I now test everything beforehand and tell myself: “Assume your system is broken unless confirmed through testing!”

Also, <b>”Write a lot of unit tests”</b>

### <ul>Failure 4</ul> Deploying code into production on the Fridays

I did a few Friday deployments which ruined my co-worker’s weekend and mine too. Some of this urge to ship may manifested from the delays in the sprint work (Failure 2).

Shipping code is fun, but breaking things for customers during the weekend when everyone’s unavailable is a nightmare. I still get that urge sometimes, but with a decade of industry experience, I know some things are better postponed — and Friday releases are definitely one of them.

<b>>What Helped Me?</b>

1. Not deploying on Fridays unless the team approves it
2. Not doing any major code merges before going on a vacation
3. Being empathetic about my colleagues & their time

## <ul>Failure 5</ul> Restarting a production database mistakenly
I once mistakenly restarted a production PostgreSQL database because I had multiple AWS console tabs open (dev, test, and production) and clicked on the wrong tab. This happened because I lost concentration during my end-of-day routine of stopping the database server in the test environment.

Luckily, it was just a simple restart of an AWS RDS instance — no data was lost and no requests were dropped — but I still remember that heart-stopping moment when I realized I was working on a production database.

After that incident, I installed a Google Chrome extension [AWS-Colorize](https://chromewebstore.google.com/detail/aws-colorize/mdbbjjffailicnmbohffnjflngmpinco) that marks production accounts in red, helping me visually avoid any destructive actions.

### What Helped Me?

Nowadays, I triple-check while operating on a production account. I developed the habit of staying alert to keep myself and others safe while performing destructive operations like writing and deleting data during complex migrations. Resource isolation is also another way to keep accidental stepping of production workloads.

## <ul>Failure 6</ul> Getting stuck in the head for way too long

Four years ago, during a daily standup meeting, I experienced a complete mental blank when my turn came and couldn’t say a single word about my current task for several minutes. My colleagues listened in silence, clearly struggling with the awkward situation. I picked a task and went into a rabbit hole of low-level details, missing the top-level goal completely which was caused by brain fade.

Maybe I was building up hidden mental fatigue over a long period without realizing it until it finally surfaced on one difficult day.

It was a very awkward moment. I could have prepared for the meeting in advance, knowing I had to report during the call, but I failed to do so.

<b>What Helped Me?</b>
Here are the mental adjustments I made thereafter:

1. <i>Be prepared for important meetings</i>
2. <i>Don’t go through endless rabbit holes, know when to stop and seek help</i>

## <ul>Failure 7</ul> Laying out grand plans but not executing them

In my previous companies, I consistently brought fresh thoughts and new ideas to every sprint review meeting. Even in 1:1 with managers, I shared many improvements for ongoing efforts. This is a welcoming thing because I am contributing where I was expected to.

Looking back, I realize I generate new ideas faster than I can execute them, and execution is what creates value for my team and company. I regret not choosing two or three top ideas from my collection and seeing them through to completion.

I learned the hard way why people say “It’s hard to multitask from end to end.” A few great books I read lately suggested I focus on the top two initiatives and delegate the rest.

<b>What Helped Me?</b>
1. Follow the Eisenhower Method for prioritization
2. Hold the excitement to work on new shiny things


## Final Thoughts

Thanks for reading my failed Resume. The point here is not to focus on failures but on how they gave me a chance to learn and correct myself for future endeavors. If you’re a young person reading this, remember that we’re all learning together, so keep turning your failures into opportunities. All humans make mistakes, and I am no exception. That’s all I have to say!


## References

- [Eisenhower Matrix: Wikipedia](https://en.wikipedia.org/wiki/Priority_Matrix)
- [Chrome extension to color AWS accounts: ChromeWebStore](https://chromewebstore.google.com/detail/aws-colorize/mdbbjjffailicnmbohffnjflngmpinco)
- [Brain Fade & Cause: HealthLine](https://www.healthline.com/health/brain-fog)
- [Favorite book on topic: Amazon](https://www.amazon.com/Do-Work-Overcome-Resistance-Your/dp/8119216490/)
- [Motivation to this article: Harvard Business Review](https://hbr.org/2016/05/write-a-failure-resume-to-learn-what-makes-you-succeed)
