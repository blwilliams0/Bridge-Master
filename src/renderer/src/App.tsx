import { HomeScreen } from '@renderer/components/home/HomeScreen'
import { Table } from '@renderer/components/table/Table'
import { useGameStore } from '@renderer/store/gameStore'

function App(): React.JSX.Element {
  const view = useGameStore((s) => s.view)
  return view === 'home' ? <HomeScreen /> : <Table />
}

export default App
