import { Img } from '@/dxCanvas'
import GeometrySetting from '../geometry'

const CircuitSetting = ({ selectList }: { selectList: Img[] }) =>
  <GeometrySetting selectList={selectList} title="图元" />

export default CircuitSetting
