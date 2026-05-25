import React from 'react'

export default function PostCard({title, excerpt}){
  return (
    <article className="post-card">
      <h3>{title}</h3>
      <p>{excerpt}</p>
    </article>
  )
}
