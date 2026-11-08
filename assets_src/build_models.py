import math
import bpy
from mathutils import Vector

bpy.ops.wm.open_mainfile(filepath="/app/assets_src/BASEmodel.blend")
body = bpy.data.objects["Cube"]
body.name = "Body"
for o in list(bpy.data.objects):
    if o.type in ("CAMERA", "LIGHT"):
        bpy.data.objects.remove(o)
bpy.context.view_layer.objects.active = body
body.select_set(True)
for m in list(body.modifiers):
    if m.type == "ARMATURE" and m.object is None:
        body.modifiers.remove(m)
bpy.ops.object.modifier_apply(modifier="Mirror")
sub = body.modifiers.new("Sub", "SUBSURF")
sub.levels = 1
bpy.ops.object.modifier_move_to_index(modifier="Sub", index=0)
bpy.ops.object.modifier_apply(modifier="Sub")
bpy.ops.object.shade_smooth()

arm = bpy.data.objects["Armature"]
bones = {b.name: arm.matrix_world @ b.head_local for b in arm.data.bones}


def g(x, c, w):
    return math.exp(-((x - c) / w) ** 2)


def seg_offset(p, a, b):
    ab = b - a
    t = max(0.0, min(1.0, (p - a).dot(ab) / ab.length_squared))
    return a + ab * t, t


def arm_axis(p):
    side = "L" if p.x > 0 else "R"
    a, b, h = bones[f"upperarm.{side}"], bones[f"lowerarm.{side}"], bones[f"hand.{side}"]
    c1, t1 = seg_offset(p, a, b)
    c2, t2 = seg_offset(p, b, h)
    return (c1, "upper") if (p - c1).length < (p - c2).length else (c2, "lower")


def leg_axis(p):
    side = "L" if p.x > 0 else "R"
    a, b, f = bones[f"upperleg.{side}"], bones[f"lowerleg.{side}"], bones[f"foot.{side}"]
    c1, _ = seg_offset(p, a, b)
    c2, _ = seg_offset(p, b, f)
    return (c1, "thigh") if (p - c1).length < (p - c2).length else (c2, "calf")


def is_arm(p):
    return abs(p.x) > 0.5 and p.z < 3.95


def is_leg(p):
    return p.z < 2.3 and abs(p.x) > 0.02


def shape(name, fn):
    body.shape_key_add(name="Basis", from_mix=False) if not body.data.shape_keys else None
    sk = body.shape_key_add(name=name, from_mix=False)
    for i, v in enumerate(body.data.vertices):
        sk.data[i].co = fn(v.co.copy())


def female(p):
    q = p.copy()
    if not is_arm(p) and p.z > 2.2:
        bust = g(abs(p.x), 0.2, 0.13) * g(p.z, 3.42, 0.17) * (1 if p.y < 0 else 0)
        q.y -= 0.26 * bust
        q.z -= 0.03 * bust
        q.x *= 1 - 0.17 * g(p.z, 2.95, 0.22) - 0.1 * g(p.z, 3.8, 0.12)
        q.x *= 1 + 0.22 * g(p.z, 2.4, 0.2)
        q.y *= 1 + 0.08 * g(p.z, 2.45, 0.18) * (1 if p.y > 0 else 0.3)
    if p.z > 3.9 and p.z < 4.2:
        q.x *= 0.88
        q.y *= 0.9
    if is_arm(p):
        c, _ = arm_axis(p)
        q = c + (p - c) * 0.85
        q.x -= 0.04 if p.x > 0 else -0.04
    if is_leg(p):
        c, part = leg_axis(p)
        k = 1.1 if part == "thigh" else 0.95
        q = c + (p - c) * k
    return q


def heavy(p):
    q = p.copy()
    if not is_arm(p) and 2.1 < p.z < 3.9:
        q.x *= 1 + 0.2 * g(p.z, 2.9, 0.5)
        if p.y < 0:
            q.y -= 0.22 * g(p.z, 2.85, 0.3) * g(p.x, 0, 0.3)
        q.y *= 1 + 0.12 * g(p.z, 2.9, 0.5)
    if 3.95 < p.z < 4.3:
        q.x *= 1.15
    if is_arm(p):
        c, _ = arm_axis(p)
        q = c + (p - c) * 1.3
    if is_leg(p):
        c, _ = leg_axis(p)
        q = c + (p - c) * 1.22
    return q


def slim(p):
    q = p.copy()
    if not is_arm(p) and 2.1 < p.z < 3.95:
        q.x *= 0.88
        q.y *= 0.88
    if is_arm(p):
        c, _ = arm_axis(p)
        q = c + (p - c) * 0.82
    if is_leg(p):
        c, _ = leg_axis(p)
        q = c + (p - c) * 0.85
    return q


def muscular(p):
    q = p.copy()
    if not is_arm(p) and 3.0 < p.z < 4.0:
        q.x *= 1 + 0.14 * g(p.z, 3.6, 0.3)
        if p.y < 0:
            q.y -= 0.08 * g(abs(p.x), 0.22, 0.15) * g(p.z, 3.5, 0.18)
    if not is_arm(p) and 3.75 < p.z < 4.05 and abs(p.x) < 0.5:
        q.z += 0.06 * g(abs(p.x), 0.32, 0.14)
    if is_arm(p):
        c, part = arm_axis(p)
        q = c + (p - c) * (1.35 if part == "upper" else 1.18)
    if is_leg(p):
        c, part = leg_axis(p)
        q = c + (p - c) * (1.15 if part == "thigh" else 1.1)
    return q


def limbs(q, p, arm_k, leg_k, arm_up=None):
    if is_arm(p):
        c, part = arm_axis(p)
        q = c + (p - c) * (arm_up if arm_up and part == "upper" else arm_k)
    if is_leg(p):
        c, _ = leg_axis(p)
        q = c + (p - c) * leg_k
    return q


def skinny(p):
    q = p.copy()
    if not is_arm(p) and 2.1 < p.z < 4.2:
        q.x *= 0.78
        q.y *= 0.8
    return limbs(q, p, 0.68, 0.72)


def belly(p):
    q = p.copy()
    if not is_arm(p) and 2.2 < p.z < 3.7:
        k = g(p.z, 2.85, 0.32)
        if p.y < 0:
            q.y -= 0.42 * k * g(p.x, 0, 0.34)
        q.x *= 1 + 0.18 * k
        q.y *= 1 + 0.1 * k
    return limbs(q, p, 1.12, 1.1)


def chubby(p):
    q = p.copy()
    if not is_arm(p) and 2.0 < p.z < 3.95:
        k = g(p.z, 2.85, 0.55)
        q.x *= 1 + 0.3 * k
        q.y *= 1 + 0.3 * k
        if p.y < 0:
            q.y -= 0.18 * g(p.z, 2.8, 0.3) * g(p.x, 0, 0.35)
    if 3.9 < p.z < 4.25:
        q.x *= 1.22
        q.y *= 1.15
    return limbs(q, p, 1.4, 1.35)


def curvy(p):
    q = p.copy()
    if not is_arm(p) and p.z > 2.0 and p.z < 3.9:
        q.x *= 1 + 0.3 * g(p.z, 2.4, 0.22) - 0.12 * g(p.z, 2.95, 0.18)
        q.y *= 1 + 0.14 * g(p.z, 2.4, 0.2) * (1 if p.y > 0 else 0.4)
    q = limbs(q, p, 1.05, 1.0)
    if is_leg(p):
        c, part = leg_axis(p)
        q = c + (p - c) * (1.32 if part == "thigh" else 1.08)
    return q


def brute(p):
    q = p.copy()
    if not is_arm(p) and 2.6 < p.z < 4.05:
        k = g(p.z, 3.5, 0.38)
        q.x *= 1 + 0.38 * k
        q.y *= 1 + 0.3 * k
        if p.y < 0:
            q.y -= 0.12 * g(p.z, 3.45, 0.2)
    if not is_arm(p) and 3.8 < p.z < 4.1 and abs(p.x) < 0.6:
        q.z += 0.1 * g(abs(p.x), 0.35, 0.16)
    if 3.95 < p.z < 4.25:
        q.x *= 1.28
    if is_arm(p):
        c, part = arm_axis(p)
        q = c + (p - c) * (1.75 if part == "upper" else 1.5)
        q.x += 0.06 if p.x > 0 else -0.06
    if is_leg(p):
        c, _ = leg_axis(p)
        q = c + (p - c) * 1.08
    return q


def head_w(p):
    return 0.0 if p.z < 4.12 else min(1.0, (p.z - 4.12) / 0.1)


def face_round(p):
    q = p.copy()
    w = head_w(p)
    q.x *= 1 + w * (0.16 * g(p.z, 4.38, 0.12))
    if p.y < 0:
        q.y *= 1 + w * 0.06 * g(p.z, 4.38, 0.1)
    if p.z < 4.32:
        q.z += w * (4.32 - p.z) * 0.35
    return q


def face_square(p):
    q = p.copy()
    w = head_w(p)
    q.x *= 1 + w * 0.2 * g(p.z, 4.3, 0.08)
    if p.z < 4.27:
        q.z += w * (4.27 - p.z) * 0.45
    return q


def face_long(p):
    q = p.copy()
    if 4.12 < p.z < 4.45:
        q.z -= 0.1 * min(1.0, (4.45 - p.z) / 0.2) * head_w(p)
    q.x *= 1 - 0.08 * head_w(p) * g(p.z, 4.32, 0.12)
    return q


def face_jaw(p):
    q = p.copy()
    w = head_w(p)
    q.x *= 1 + w * 0.16 * g(p.z, 4.28, 0.08)
    if p.y < 0:
        q.y -= w * 0.08 * g(p.z, 4.25, 0.06) * g(p.x, 0, 0.14)
    if 4.12 < p.z < 4.3:
        q.z -= 0.04 * w
    return q


def face_narrow(p):
    q = p.copy()
    q.x *= 1 - 0.14 * head_w(p) * g(p.z, 4.4, 0.16)
    return q


mw = body.matrix_world.copy()
inv = mw.inverted()
body.shape_key_add(name="Basis", from_mix=False)
for nm, fn in (("female", female), ("heavy", heavy), ("slim", slim), ("muscular", muscular),
               ("skinny", skinny), ("belly", belly), ("chubby", chubby), ("curvy", curvy), ("brute", brute),
               ("face_round", face_round), ("face_square", face_square), ("face_long", face_long),
               ("face_jaw", face_jaw), ("face_narrow", face_narrow)):
    sk = body.shape_key_add(name=nm, from_mix=False)
    for i, v in enumerate(body.data.vertices):
        sk.data[i].co = inv @ fn(mw @ v.co)

mat = bpy.data.materials.new("Skin")
body.data.materials.append(mat)
print("FACES", len(body.data.polygons), "VERTS", len(body.data.vertices))
bpy.ops.object.select_all(action="SELECT")
bpy.ops.export_scene.gltf(filepath="/tmp/base_raw.glb", export_format="GLB", use_selection=True,
                          export_apply=False, export_skins=True, export_morph=True, export_morph_normal=False, export_draco_mesh_compression_enable=False, export_draco_mesh_compression_level=7, export_draco_position_quantization=13, export_draco_normal_quantization=8,
                          export_animations=False, export_yup=True, export_texcoords=False, export_normals=True)
