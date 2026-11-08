set -e
for g in male female; do
  [ -f out/$g-pos.obj ] || python3 - $g <<'PY'
import sys,re
g=sys.argv[1]
out=open(f'out/{g}-pos.obj','w')
for line in open(f'/workspace/game-assets/{g}-model.obj'):
    if line.startswith('v '): out.write(line)
    elif line.startswith('f '):
        out.write('f '+' '.join(t.split('/')[0] for t in line.split()[1:])+'\n')
out.close()
PY
  npx obj2gltf -i out/$g-pos.obj -o out/$g-raw2.glb --binary
  npx gltf-transform weld out/$g-raw2.glb out/$g-w2.glb
  npx gltf-transform simplify out/$g-w2.glb out/$g-s2.glb --ratio 0.11 --error 0.01
  npx gltf-transform draco out/$g-s2.glb out/$g.glb --method edgebreaker
  npx gltf-transform inspect out/$g.glb | grep -A3 "renderVertexCount" | tail -1
  ls -la out/$g.glb
done
