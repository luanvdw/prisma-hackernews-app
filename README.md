# Prisma Hacker News App

## Setup

## Database structure
The database schema consists of four main models:

- User: Represents registered users who can create posts, comments, and votes.
- Post: Represents submitted stories or links, created by users.
- Comment: Represents user comments on posts or replies to other comments.
- Vote: Represents upvotes or downvotes cast by users on posts or comments.

```mermaid
erDiagram
    User ||--o{ Post : creates
    User ||--o{ Comment : writes
    User ||--o{ Vote : casts
    Post ||--o{ Comment : has
    Post ||--o{ Vote : receives
    Comment ||--o{ Vote : receives
    Comment ||--o{ Comment : replies-to

    User {
        String id PK
        DateTime createdAt
        DateTime updatedAt
        String username
        String email
        String password
        Int karma
    }

    Post {
        String id PK
        DateTime createdAt
        DateTime updatedAt
        String title
        String url
        String content
        String authorId FK
    }

    Comment {
        String id PK
        DateTime createdAt
        DateTime updatedAt
        String content
        String authorId FK
        String postId FK
        String parentId FK
    }

    Vote {
        String id PK
        DateTime createdAt
        DateTime updatedAt
        Int value
        String userId FK
        String postId FK
        String commentId FK
    }
```