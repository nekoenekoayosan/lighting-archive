'use client'

interface PhysicalSwitchProps {
  isOn: boolean
  onChange: (isOn: boolean) => void
}

export function PhysicalSwitch({ isOn, onChange }: PhysicalSwitchProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={() => onChange(!isOn)}
        aria-label={isOn ? '照明を消す' : '照明をつける'}
        className="focus:outline-none active:scale-95 transition-transform duration-100"
      >
        <div className="switch-plate">
          {/* ON：上が奥に傾く（上を押した状態）/ OFF：下が奥に傾く（下を押した状態） */}
          <div
            className="switch-rocker"
            style={{
              transform: isOn ? 'rotateX(14deg)' : 'rotateX(-14deg)',
            }}
          />
        </div>
      </button>
      <span className="text-gray-400 text-sm font-noto">
        {isOn ? 'ON' : 'OFF'}
      </span>
    </div>
  )
}
