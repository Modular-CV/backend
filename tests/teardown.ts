import { execSync } from 'child_process'

const teardown = () => {
  execSync('yarn test:compose:stop')
}

export default teardown
