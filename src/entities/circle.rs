use bevy::prelude::*;
use crate::components::{Velocity, CircleCollider};

pub fn spawn_circle(
    commands: &mut Commands,
    meshes: &mut ResMut<Assets<Mesh>>,
    materials: &mut ResMut<Assets<ColorMaterial>>,
    position: Vec2,
    velocity: Vec2,
    radius: f32,
    color: Color,
) {
    commands.spawn((
        Mesh2d(meshes.add(Circle::new(radius))),
        MeshMaterial2d(materials.add(ColorMaterial::from(color))),
        Transform::from_translation(position.extend(0.0)),
        Velocity(velocity),
        CircleCollider { radius },
    ));
}
