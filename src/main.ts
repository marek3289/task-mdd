import axios from 'axios'
import './style.css'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('../service-worker.js')
      .then(registration => console.log('ServiceWorker registration successful with scope: ', registration.scope))
      .catch(err => console.log('ServiceWorker registration failed: ', err))
  })
}

interface IPost {
  id: number
  userId: number
  title: string
  body: string
}

interface IComment {
  id: number
  postId: number
  name: string
  email: string
  body: string
}

interface IFilteredPost extends IPost {
  comments: IComment[]
}

async function getPosts(): Promise<IPost[]> {
  return axios('https://jsonplaceholder.typicode.com/posts').then(res => res.data)
}

async function getComments(): Promise<IComment[]> {
  return axios('https://jsonplaceholder.typicode.com/comments').then(res => res.data)
}

async function fetchPosts(): Promise<IFilteredPost[] | null> {
  try {
    await setTimeout(() => console.log('Delayed for 3 second.'), 3000)

    const [posts, comments] = await Promise.all([getPosts(), getComments()])
    const filteredPosts = posts.map(post => ({ ...post, comments: comments.filter(comment => comment.postId === post.id) }))

    return filteredPosts
  } catch (err) {
    console.log('err', err)
    return null
  }
}

async function init(root: HTMLElement): Promise<void> {
  try {
    const posts = await fetchPosts()

    root.innerHTML = ''

    if (posts && posts.length > 0) {
      const listElement = document.createElement('ul')
      listElement.classList.add('space-y-4')

      posts.forEach((post: IFilteredPost) => {
        const postElement = document.createElement('li')
        postElement.classList.add('relative', 'px-4', 'py-10', 'bg-white', 'shadow-lg', 'sm:rounded-3xl', 'sm:p-20', 'bg-clip-padding', 'bg-opacity-60', 'border', 'border-gray-200')

        postElement.innerHTML = `
          <h2 class='mb-2 text-xl font-bold'>${post.title}</h2>
          <p class='mb-4'>${post.body}</p>
        `

        if (post.comments && post.comments.length > 0) {
          const commentsSection = document.createElement('section')

          const commentsList = document.createElement('ul')
          commentsList.classList.add('pl-5', 'mt-4', 'text-sm', 'text-gray-600')

          const commentsHeading = document.createElement('h3')
          commentsHeading.classList.add('mt-4', 'text-lg', 'text-gray-800')
          commentsHeading.textContent = 'Comments:'

          post.comments.forEach(comment => {
            const commentElement = document.createElement('li')
            commentElement.textContent = comment.body
            commentsList.appendChild(commentElement)
          })

          commentsSection.appendChild(commentsHeading)
          commentsSection.appendChild(commentsList)
          postElement.appendChild(commentsSection)
        }
        
        listElement.appendChild(postElement)
      })

      root.appendChild(listElement)
    } else {
      root.innerHTML = '<p class="text-gray-500">No posts found</p>' 
    }
  } catch (err) {
    root.innerHTML = '<p class="text-red-500">Failed to load posts.</p>'
  }
}


document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1 class='mb-8'>MDD Task Rekrutacyjny</h1>
    <div id='root'>
      <p>Loading...</p>
    </div>
  </div>
`

init(document.querySelector<HTMLDListElement>('#root')!)
