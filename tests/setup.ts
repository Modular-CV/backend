import { execSync } from 'child_process'

const setup = () => {
  execSync('yarn test:db')
}

export default setup
