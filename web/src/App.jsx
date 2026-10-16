import './App.css'
import { Show, SignInButton, UserButton } from '@clerk/react'

function App() {
  return (
    <>
      <h1>hello world</h1>
      {/* token with the req*/}
      <Show when="signed-out">
        <SignInButton mode="modal" />
      </Show>
      <Show when="signed-in">
          <UserButton />
      </Show>
    </>
  )
}

export default App
