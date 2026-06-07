from sqlalchemy.orm import Session
import models, auth

def seed_data(db: Session):
    if db.query(models.User).count() > 0:
        return

    users_data = [
        {
            "username": "alex_morgan",
            "email": "alex@inkwell.dev",
            "password": "password123",
            "full_name": "Alex Morgan",
            "bio": "Senior software engineer at a Series B startup. I write about web architecture, developer experience, and the occasional deep dive into systems programming.",
            "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=alex&backgroundColor=b6e3f4"
        },
        {
            "username": "priya_sharma",
            "email": "priya@inkwell.dev",
            "password": "password123",
            "full_name": "Priya Sharma",
            "bio": "ML engineer & researcher. Passionate about making AI explainable. PhD dropout turned industry practitioner. Writing about machine learning, data, and ethics.",
            "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=priya&backgroundColor=c0aede"
        },
        {
            "username": "james_okafor",
            "email": "james@inkwell.dev",
            "password": "password123",
            "full_name": "James Okafor",
            "bio": "Full-stack developer & open source contributor. I love TypeScript, clean code, and coffee. Currently building dev tools at a remote-first company.",
            "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=james&backgroundColor=d1d4f9"
        },
        {
            "username": "sofia_chen",
            "email": "sofia@inkwell.dev",
            "password": "password123",
            "full_name": "Sofia Chen",
            "bio": "Product designer turned frontend dev. I care deeply about accessibility, design systems, and the intersection of design and code.",
            "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=sofia&backgroundColor=ffd5dc"
        },
        {
            "username": "rajan_patel",
            "email": "rajan@inkwell.dev",
            "password": "password123",
            "full_name": "Rajan Patel",
            "bio": "DevOps & cloud architect. AWS certified. I simplify complex infrastructure topics and share real-world lessons from running production systems at scale.",
            "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=rajan&backgroundColor=c9f0d8"
        }
    ]

    users = []
    for u in users_data:
        user = models.User(
            username=u["username"],
            email=u["email"],
            hashed_password=auth.hash_password(u["password"]),
            full_name=u["full_name"],
            bio=u["bio"],
            avatar_url=u["avatar_url"]
        )
        db.add(user)
        users.append(user)
    db.flush()

    posts_data = [
        {
            "author_idx": 0,
            "title": "Why I Switched From REST to GraphQL (And Then Switched Back)",
            "cover_image": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
            "featured": True,
            "tags": ["web development", "graphql", "api design", "backend"],
            "content": """After three years of building REST APIs professionally, I made the jump to GraphQL. Six months later, I quietly migrated back. Here's the honest story.

## The Honeymoon Phase

When our team first adopted GraphQL, it felt revolutionary. The ability to request exactly the data you need, no more, no less, was genuinely magical. Overfetching? Gone. Multiple roundtrips to assemble a complex UI? Solved with a single query.

Our frontend developers were ecstatic. They could iterate on UI requirements without waiting for backend changes. The schema served as living documentation. Everything felt right.

```graphql
query GetUserDashboard($userId: ID!) {
  user(id: $userId) {
    name
    avatar
    recentPosts(limit: 5) {
      title
      publishedAt
      likes
    }
    notifications(unread: true) {
      message
      createdAt
    }
  }
}
```

## The Problems Nobody Talks About

The cracks started showing around month two. First, **N+1 queries**. Without DataLoader properly configured, every nested resolver was hammering our database. Our PostgreSQL load spiked 400% on what should have been simple queries.

Then came **caching**. REST's GET requests cache beautifully at every layer — CDN, browser, reverse proxy. GraphQL sends everything as POST. Suddenly our carefully configured Cloudfront setup was useless. We had to implement application-level caching, which meant writing and maintaining a Redis layer ourselves.

The third problem was **authorization**. In REST, you reason about authorization at the endpoint level. In GraphQL, authorization logic spreads across resolvers. We had security holes we didn't catch for two weeks because a deeply nested field on the User type wasn't properly guarded.

## What I Learned

GraphQL shines when you have many clients with genuinely different data needs — like a public API serving web, mobile, and third parties simultaneously. For an internal API serving one frontend? REST is often simpler to reason about, cache, and secure.

The switching cost matters too. Tooling, team knowledge, debugging muscle memory — these compound. Choose GraphQL deliberately, not because it's modern.

I don't regret the experiment. I understand GraphQL deeply now. But our current REST API, thoughtfully designed with sparse fieldsets and proper HTTP semantics, serves us just as well without the operational complexity.""",
        },
        {
            "author_idx": 1,
            "title": "How I Explained Transformer Attention to My Non-Technical Friends",
            "cover_image": "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80",
            "featured": True,
            "tags": ["machine learning", "ai", "explainability", "transformers"],
            "content": """Everyone's talking about LLMs. Few people understand the mechanism that makes them work. Here's the explanation I give at dinner parties that actually lands.

## The Library Analogy

Imagine you're in a vast library, writing a sentence. You've written "The bank by the river was..." and you need to decide what comes next.

In that library, every word you've ever read is a book on a shelf. As you write, you automatically glance at every relevant book — but not equally. The word "river" makes you look *hard* at geography books, water books, nature books. The word "bank" makes you glance at both financial books *and* geography books. The combination tells you to focus on geography.

This is attention. Not magic — just very sophisticated glancing.

## The Math (I Promise It's Simple)

For every word in the input, transformers compute three things:
- **Query** (Q): What am I looking for?
- **Key** (K): What do I have to offer?
- **Value** (V): What's my actual content?

Attention is computed as: `softmax(QK^T / √d) × V`

The square root of d is just a scaling factor to keep numbers stable. The softmax turns raw scores into probabilities that sum to 1. So each output word is a *weighted average* of all the value vectors, where the weights come from how much each word "attends" to every other word.

## Why Multi-Head?

Single attention can only capture one relationship at a time. Multi-head attention runs this process in parallel with different learned projections — one head might capture syntactic relationships, another semantic ones, another positional dependencies.

```python
# Simplified multi-head attention
def attention(Q, K, V):
    scores = Q @ K.T / math.sqrt(d_k)
    weights = softmax(scores)
    return weights @ V

outputs = [attention(Q_i, K_i, V_i) for i in range(num_heads)]
result = concat(outputs) @ W_output
```

## The Beautiful Part

What makes this revolutionary isn't the math — it's that the model learns *which relationships to pay attention to* during training. Nobody told GPT-4 that "bank" near "river" means geography. It discovered this pattern from billions of examples.

That's what makes transformers so general. The attention mechanism is a learnable, differentiable way to route information. Apply it to text, images, audio, proteins — it doesn't care. It just learns the relevant relationships in whatever domain you throw at it.""",
        },
        {
            "author_idx": 2,
            "title": "TypeScript Tricks That Will Change How You Write Code",
            "cover_image": "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80",
            "featured": True,
            "tags": ["typescript", "javascript", "web development", "tips"],
            "content": """I've been writing TypeScript for four years. These are the patterns I reach for constantly that most tutorials never mention.

## Branded Types for Runtime Safety

Plain `string` and `number` types are dangerously permissive. How many times have you accidentally passed a `userId` where an `orderId` was expected? Branded types fix this:

```typescript
type UserId = string & { readonly __brand: 'UserId' }
type OrderId = string & { readonly __brand: 'OrderId' }

function getUser(id: UserId) { ... }
function getOrder(id: OrderId) { ... }

const userId = 'usr_123' as UserId
const orderId = 'ord_456' as OrderId

getUser(orderId) // ✅ TypeScript Error! Type 'OrderId' is not assignable to 'UserId'
```

Zero runtime overhead. Pure compile-time safety. I use this for every ID type in production code.

## Template Literal Types

This is TypeScript's hidden superpower:

```typescript
type EventName = 'click' | 'focus' | 'blur'
type Handler = `on${Capitalize<EventName>}` // 'onClick' | 'onFocus' | 'onBlur'

type CSSProperty = 'margin' | 'padding'
type CSSDirection = 'top' | 'right' | 'bottom' | 'left'
type CSSKey = `${CSSProperty}-${CSSDirection}`
// 'margin-top' | 'margin-right' | ... | 'padding-left'
```

I use this to type event handler names, CSS-in-JS properties, API endpoint paths, and i18n translation keys.

## Exhaustive Switch with `never`

Stop forgetting to handle new union members:

```typescript
type Shape = 'circle' | 'square' | 'triangle'

function area(shape: Shape): number {
  switch(shape) {
    case 'circle': return Math.PI * r * r
    case 'square': return side * side
    default:
      const _exhaustive: never = shape // Error if triangle isn't handled!
      throw new Error(`Unhandled: ${shape}`)
  }
}
```

When you add 'hexagon' to Shape, TypeScript immediately errors at every switch that doesn't handle it.

## Const Assertions for Immutable Config

```typescript
const ROUTES = {
  home: '/',
  profile: '/profile',
  settings: '/settings',
} as const

type Route = typeof ROUTES[keyof typeof ROUTES]
// '/' | '/profile' | '/settings'
```

The config is deeply readonly, and you get a derived type for free. No separate enum needed.

These patterns sound simple but they scale. On a large codebase, branded IDs alone have saved my team from dozens of subtle bugs.""",
        },
        {
            "author_idx": 3,
            "title": "The Design System That Finally Stuck: Lessons From Three Failed Attempts",
            "cover_image": "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80",
            "featured": False,
            "tags": ["design", "frontend", "css", "design systems"],
            "content": """Every design system starts with ambition and ends with a graveyard of unused components. Here's how we broke that pattern.

## What Killed Our First Two Attempts

**Attempt 1** failed because we built for hypothetical future needs. We designed a component library with every variant imaginable before anyone had used it. The API was so complex that developers preferred writing bespoke CSS.

**Attempt 2** failed because we ignored adoption. We built beautiful components, wrote great documentation, then made using them "optional." Six months later, 30% of the codebase used the system and 70% was still ad-hoc.

The insight that changed everything: **a design system is a social project, not a technical one.**

## The Three Principles That Worked

**1. Start with tokens, not components**

Don't build a Button component first. Build the foundation:

```css
:root {
  /* Spacing */
  --space-1: 4px;  --space-2: 8px;
  --space-3: 12px; --space-4: 16px;

  /* Colors */
  --color-primary-500: #2563EB;
  --color-primary-600: #1D4ED8;
  --color-neutral-50: #F9FAFB;

  /* Typography */
  --font-size-sm: 14px;
  --line-height-relaxed: 1.625;
}
```

When tokens are right, components naturally follow. When components are built first, tokens become an afterthought.

**2. Make the right thing the easy thing**

We wrapped our most-used components in a simple API that handled 90% of use cases with minimal props, while still allowing escape hatches for the 10%.

**3. Co-locate design decisions with code**

We embedded the design rationale inside the component file as comments. Not in a separate Notion doc, not in Figma — in the code. Developers actually read it because it was right there.

## The Adoption Lever Nobody Talks About

We ran "migration sprints" — dedicated time for developers to convert old components to the system. We treated it like debt payoff, not optional cleanup. Within three months, system coverage went from 30% to 94%.

The system succeeded when leadership made it a priority, not just a preference.""",
        },
        {
            "author_idx": 4,
            "title": "Zero to Kubernetes: What I Wish Someone Had Told Me",
            "cover_image": "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&q=80",
            "featured": False,
            "tags": ["devops", "kubernetes", "cloud", "infrastructure"],
            "content": """Kubernetes has a brutal learning curve. I spent three months confused before things clicked. Here's the mental model I wish I'd had from day one.

## The One Analogy That Explains Everything

Think of Kubernetes as a **very opinionated restaurant manager**.

You (the developer) don't tell the kitchen *how* to make food. You hand the manager a **menu** (your desired state) and say "I want 3 portions of this dish available at all times." The manager handles everything: which chef makes it, what happens if a chef quits, scaling up during rush hour.

That menu is your YAML. Kubernetes is the manager. Your containers are the chefs.

## The Objects You Actually Need to Understand First

Forget StatefulSets, DaemonSets, and CRDs for now. Start with these four:

**Pod**: The smallest deployable unit. One or more containers that share network and storage. You rarely create these directly.

**Deployment**: Manages Pods. Handles rolling updates and rollbacks. "Keep 3 replicas of this Pod running."

**Service**: Stable network endpoint for Pods. Pods come and go; Services stay. Your app talks to Services, not Pods.

**Ingress**: HTTP routing from outside the cluster. "Route /api to backend service, / to frontend service."

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    spec:
      containers:
      - name: app
        image: my-app:v1.2
        resources:
          requests:
            memory: "64Mi"
            cpu: "250m"
          limits:
            memory: "128Mi"
            cpu: "500m"
```

## The Biggest Mistake I Made

I ignored resource requests and limits. My pods were running fine locally, then randomly evicted in production because other workloads needed resources. **Always set resources.** Always.

## When You Actually Need Kubernetes

Kubernetes solves real problems at scale. But for a single service with predictable load? It's overkill. I've seen teams spend six months getting Kubernetes right when they should have shipped features.

The question isn't "how do I use Kubernetes?" It's "do I have the problems Kubernetes solves?" If you're not running multiple services with independent scaling needs, start simpler.""",
        },
        {
            "author_idx": 0,
            "title": "Building a URL Shortener in 30 Minutes: A System Design Walkthrough",
            "cover_image": "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&q=80",
            "featured": False,
            "tags": ["system design", "backend", "architecture", "web development"],
            "content": """The URL shortener is the "Hello World" of system design interviews. But building one from scratch reveals surprisingly deep problems.

## Requirements First

Before writing a line of code, nail the requirements:
- Shorten a long URL to a 7-character code
- Redirect users to the original URL
- Handle 1,000 writes/sec, 100,000 reads/sec (reads dominate)
- URLs persist for 5 years
- Analytics: click counts per URL

## The Core Algorithm

The key insight: you need to map a short code to a long URL. Two approaches:

**Hashing**: MD5 the URL, take first 7 chars. Problem: collisions. Two URLs can produce the same 7 chars.

**Counter + Base62 encoding**: Maintain a global counter. Encode the counter value in base62 (a-z, A-Z, 0-9 = 62 chars). 7 chars = 62^7 = 3.5 trillion unique URLs.

```python
import string

CHARS = string.ascii_letters + string.digits  # 62 chars

def encode(n: int) -> str:
    result = []
    while n:
        result.append(CHARS[n % 62])
        n //= 62
    return ''.join(reversed(result)).zfill(7)

def decode(s: str) -> int:
    return sum(CHARS.index(c) * (62 ** i) for i, c in enumerate(reversed(s)))
```

## The Read Bottleneck

100,000 reads/sec hits your database hard. Solution: cache aggressively.

```
Request → Cache hit? → Return URL (fast)
              ↓ miss
         Database lookup → Store in cache → Return URL
```

Use Redis with a 24-hour TTL. Popular URLs stay hot in cache; rarely accessed ones fall out. With a 90% cache hit rate, only 10,000 requests/sec hit the database — very manageable.

## The Write Bottleneck: Counter Distribution

A global counter becomes a bottleneck at scale. Solutions:
1. **Range allocation**: Each server pre-allocates a range (server A gets 1M-2M, server B gets 2M-3M)
2. **Twitter Snowflake**: Distributed ID generation with machine ID + timestamp + sequence

## What I'd Do Differently

For a production system, I'd add:
- Bloom filter to check if a URL was already shortened (avoid duplicates)
- Async analytics pipeline (don't make users wait for click tracking)
- Geographic routing (users in India shouldn't hit a US server for every redirect)

The beauty of this exercise is that every requirement pushes you toward real distributed systems patterns. It's never as simple as it first appears.""",
        },
        {
            "author_idx": 1,
            "title": "The Quiet Revolution: How Edge Computing Changes AI Deployment",
            "cover_image": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
            "featured": False,
            "tags": ["ai", "machine learning", "edge computing", "infrastructure"],
            "content": """Running AI models in the cloud made sense when GPUs were expensive and models were few. That calculus is changing fast.

## The Latency Problem

A typical cloud AI inference flow: user's device → internet → data center → GPU → inference → internet → user's device.

Round trip: 80-200ms on a good day. For real-time applications — voice interfaces, AR overlays, autonomous vehicles — that's an eternity.

Edge inference eliminates the network hop. The model runs where the data is: on-device, at the cell tower, in the local edge node.

## The Privacy Revolution

Here's what changes when inference happens on-device: **the data never leaves**.

For healthcare applications, this isn't just convenient — it's legally required in many jurisdictions. A mental health app using on-device NLP to understand user journals doesn't need to worry about HIPAA violations. The model sees the text; the server never does.

## What Makes Edge Inference Possible Now

Three things converged:

**Model compression** matured. Quantization (FP32 → INT8), pruning (remove unimportant weights), and distillation (train a small model to mimic a large one) can shrink a model 10-20x with minimal quality loss.

**Hardware caught up**. Apple's Neural Engine, Qualcomm's Hexagon DSP, Google's Tensor chip — modern phones have dedicated AI accelerators that would have been supercomputers a decade ago.

**Frameworks arrived**. ONNX Runtime, TensorFlow Lite, Core ML, and MediaPipe make deploying models to edge devices approachable.

```python
# Running BERT-tiny on-device with ONNX
import onnxruntime as ort

session = ort.InferenceSession("bert-tiny-quantized.onnx",
    providers=["CPUExecutionProvider"])

# Runs in ~15ms on a 2021 phone
result = session.run(None, {"input_ids": tokens})
```

## The Hybrid Future

The future isn't cloud vs. edge — it's intelligent routing. Simple queries run on-device instantly. Complex reasoning calls the cloud. The model itself decides where to compute based on latency requirements, privacy constraints, and available resources.

We're two or three years from this being table stakes in production AI systems. The teams building the routing layer today will have a significant advantage.""",
        },
        {
            "author_idx": 3,
            "title": "CSS Grid vs Flexbox: A Practical Guide to Choosing",
            "cover_image": "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&q=80",
            "featured": False,
            "tags": ["css", "frontend", "design", "web development"],
            "content": """The "which one should I use?" question comes up constantly. The answer is simpler than most tutorials make it.

## The Core Mental Model

**Flexbox** is for one-dimensional layout. A row *or* a column. It's perfect when items need to flow and distribute themselves along a single axis.

**Grid** is for two-dimensional layout. Rows *and* columns simultaneously. Use it when you're placing items in a structured grid where position on both axes matters.

That's it. Everything else follows from this.

## When Flexbox Wins

Navigation bars, button groups, card headers, form rows — anywhere items line up in a row with spacing:

```css
.nav {
  display: flex;
  align-items: center;
  gap: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

Flexbox also handles wrapping gracefully. `flex-wrap: wrap` with `gap` gives you a responsive row that breaks naturally — no media queries needed for basic layouts.

## When Grid Wins

Page layouts, image galleries, dashboard layouts — anywhere items need precise placement:

```css
.page {
  display: grid;
  grid-template-columns: 280px 1fr;
  grid-template-rows: 64px 1fr;
  min-height: 100vh;
}

.sidebar { grid-column: 1; grid-row: 1 / -1; }
.header  { grid-column: 2; grid-row: 1; }
.main    { grid-column: 2; grid-row: 2; }
```

The `grid-template-areas` property is especially powerful for named layout regions — it reads like a diagram of your actual layout.

## The Trick: They Work Together

A Grid handles the macro layout. Flexbox handles the micro layout within each grid cell. You don't choose one — you use Grid for structure and Flexbox for component internals.

```css
.dashboard { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.card { display: flex; flex-direction: column; gap: 12px; }
.card-footer { display: flex; justify-content: space-between; align-items: center; }
```

Stop asking which is better. Ask which axis you're thinking about.""",
        },
    ]

    for p in posts_data:
        author = users[p["author_idx"]]
        import re
        slug_base = p["title"].lower().strip()
        slug_base = re.sub(r'[^\w\s-]', '', slug_base)
        slug_base = re.sub(r'[\s_-]+', '-', slug_base)
        slug = slug_base

        content = p["content"]
        excerpt = content.strip().split('\n')[0][:200].strip()

        post = models.Post(
            title=p["title"],
            slug=slug,
            content=content,
            excerpt=excerpt,
            cover_image=p["cover_image"],
            author_id=author.id,
            featured=p["featured"],
            views=0
        )

        for tag_name in p["tags"]:
            tag = db.query(models.Tag).filter(models.Tag.name == tag_name.lower()).first()
            if not tag:
                tag = models.Tag(name=tag_name.lower())
                db.add(tag)
                db.flush()
            post.tags.append(tag)

        db.add(post)
        db.flush()

    # Add comments
    db.flush()
    posts = db.query(models.Post).all()

    comments_data = [
        (0, 2, "Really well written. I went through the exact same journey. The N+1 problem with GraphQL was what finally broke us too."),
        (0, 1, "This matches my experience perfectly. GraphQL is powerful but it's not a drop-in REST replacement, it requires a different mental model for caching and auth."),
        (1, 3, "The library analogy is the best explanation of attention I've read. Going to use this the next time someone asks me what I work on."),
        (1, 0, "The simplified code makes it so much more approachable. Would love a follow-up post on positional encodings."),
        (2, 3, "Branded types just clicked for me after this post. I've been using string everywhere and had a bug last week that this would have caught immediately."),
        (2, 4, "The exhaustive switch trick is something I've been doing manually with assertions. This is cleaner. Bookmarked."),
        (3, 0, "The social project point is so underappreciated. We had amazing components that nobody used because the process for contributing was too strict."),
        (4, 2, "The restaurant manager analogy actually made Kubernetes make sense for the first time. I've read 5 blog posts and 2 books and this is the one that clicked."),
        (5, 1, "Subtle but the bloom filter point is important. I've seen URL shorteners that store duplicate long URLs because they skip this."),
        (6, 2, "The hybrid routing model is what I'm most excited about. We're already doing something like this in production for a healthcare client."),
        (7, 0, "The 'they work together' section is the key insight. Took me way too long to stop thinking of them as competing tools."),
    ]

    for post_idx, user_idx, content in comments_data:
        if post_idx < len(posts):
            comment = models.Comment(
                content=content,
                post_id=posts[post_idx].id,
                author_id=users[user_idx].id
            )
            db.add(comment)

    # Add likes
    like_pairs = [
        (0,1),(0,2),(0,3),(0,4),(1,0),(1,2),(1,3),(1,4),
        (2,0),(2,1),(2,3),(2,4),(3,0),(3,1),(3,2),(4,1),
        (4,2),(4,3),(5,1),(5,2),(5,3),(5,4),(6,0),(6,2),
        (6,3),(7,0),(7,1),(7,2),(7,4)
    ]
    for post_idx, user_idx in like_pairs:
        if post_idx < len(posts):
            like = models.Like(post_id=posts[post_idx].id, user_id=users[user_idx].id)
            db.add(like)

    db.commit()
    print("✅ Seed data created successfully!")
