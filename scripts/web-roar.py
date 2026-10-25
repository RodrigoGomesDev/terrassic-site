"""Web-only roar for the Tyrannosaurus, authored on the mod's own rig (the game files are not changed).

Uso: python3 -B scripts/web-roar.py

Four beats, all eased so nothing starts or stops on a corner:
1. wind-up (0-0.6 s): weight shifts back, head drops and the jaw cracks open;
2. lunge (0.6-1.1 s): body rises and leans in, neck snaps up, jaw opens wide;
3. sustain (1.1-2.7 s): the head sweeps side to side with the jaw trembling, arms clench, the tail answers as a wave;
4. release (2.7-4.0 s): jaw closes, the head dips past rest and settles, the tail follows last.
Sampled at 30 poses per second; the site interpolates them with Catmull-Rom. Signs follow the mod: -x raises
the neck and body, +x opens the jaw, +x lifts the tail tip down, +x swings the arms forward.
"""
import json
import math
from pathlib import Path

LENGTH, FPS = 4.0, 30
OUT = Path(__file__).resolve().parents[1] / 'public/assets/species/tyrannosaurus.roar.json'


def ramp(t, a, b):
    x = max(0.0, min(1.0, (t - a) / (b - a)))
    return x * x * x * (x * (x * 6 - 15) + 10)


def pose(t):
    wind = ramp(t, 0.0, 0.45) * (1 - ramp(t, 0.5, 0.95))          # anticipation
    up = ramp(t, 0.55, 1.05) * (1 - ramp(t, 2.65, 3.45))          # the roar itself
    jaw_open = ramp(t, 0.6, 1.0) * (1 - ramp(t, 2.6, 3.2))
    settle = ramp(t, 2.9, 3.4) * (1 - ramp(t, 3.4, 4.0))          # head dips past rest, then returns
    sweep = math.sin((t - 1.05) * math.pi / 1.6) * ramp(t, 1.0, 1.4) * (1 - ramp(t, 2.4, 2.9))
    tremor = (math.sin(t * 2 * math.pi * 8.5) * 0.6 + math.sin(t * 2 * math.pi * 13) * 0.4) * jaw_open * ramp(t, 1.0, 1.3)
    breath = math.sin((t - 0.6) * 2 * math.pi * 0.9) * up
    lag = lambda d: math.sin((t - 1.05 - d) * math.pi / 1.6) * ramp(t, 1.0 + d, 1.4 + d) * (1 - ramp(t, 2.4 + d, 3.0 + d))
    return {
        'body': {'rotation': [2.5 * wind - 6 * up + 0.8 * breath, 2.5 * sweep, 0], 'position': [0, -0.6 * wind + 1.4 * up, 0.8 * wind - 1.6 * up]},
        'neck1': {'rotation': [9 * wind - 22 * up + 6 * settle, 9 * sweep, -2 * sweep]},
        'neck2': {'rotation': [4 * wind - 9 * up + 3 * settle, 6 * sweep, 0]},
        'skull': {'rotation': [3 * wind - 9 * up + 0.6 * tremor + 2 * settle, 4 * sweep, 5 * sweep + 0.8 * tremor]},
        'jaw': {'rotation': [max(0.0, 7 * wind * (1 - up) + 41 * jaw_open + 2.2 * tremor), 0, 0]},
        'arm_l': {'rotation': [-6 * wind + 22 * up + 2 * tremor, 0, -12 * up]},
        'arm_r': {'rotation': [-6 * wind + 22 * up - 2 * tremor, 0, 12 * up]},
        'forearm_l': {'rotation': [28 * up + 3 * math.sin(t * 19) * up, 0, 0]},
        'forearm_r': {'rotation': [28 * up + 3 * math.sin(t * 19 + 1) * up, 0, 0]},
        'tail1': {'rotation': [-3 * wind + 7 * up, -3 * lag(0.12), 0]},
        'tail2': {'rotation': [-2 * wind + 3 * up, -5 * lag(0.22), 0]},
        'tail3': {'rotation': [1.5 * up, -7 * lag(0.32), 0]},
        'tail4': {'rotation': [-2 * up, -9 * lag(0.42), 0]},
        # Legs brace a little against the lunge; the shin offsets the thigh so the feet stay planted.
        'thigh_l': {'rotation': [-5 * up + 2 * wind, 0, 0]}, 'shin_l': {'rotation': [7 * up - 2 * wind, 0, 0]},
        'thigh_r': {'rotation': [-5 * up + 2 * wind, 0, 0]}, 'shin_r': {'rotation': [7 * up - 2 * wind, 0, 0]},
    }


bones = {}
for i in range(int(LENGTH * FPS) + 1):
    t = i / FPS
    for name, channels in pose(t).items():
        for channel, values in channels.items():
            bones.setdefault(name, {}).setdefault(channel, {})[f'{t:.4f}'.rstrip('0').rstrip('.') or '0'] = [round(v, 3) + 0.0 for v in values]
OUT.write_text(json.dumps({'len': LENGTH, 'loop': False, 'bones': bones}, separators=(',', ':')) + '\n')
print(f'{int(LENGTH * FPS) + 1} poses / {LENGTH} s / {len(bones)} ossos: {OUT.name}')
