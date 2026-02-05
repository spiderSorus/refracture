use bevy::prelude::*;
use rand::Rng;
use crate::entities::spawn_circle;
use crate::systems::{movement_system, bounce_system};

pub struct BouncingCirclesScenePlugin;

impl Plugin for BouncingCirclesScenePlugin {
    fn build(&self, app: &mut App) {
        app.add_systems(Startup, setup_scene)
           .add_systems(Update, (movement_system, bounce_system));
    }
}

fn setup_scene(
    mut commands: Commands,
    mut meshes: ResMut<Assets<Mesh>>,
    mut materials: ResMut<Assets<ColorMaterial>>,
    window_query: Query<&Window, With<bevy::window::PrimaryWindow>>,
) {
    let Some(window) = window_query.iter().next() else { return; };
    let width = window.width();
    let height = window.height();
    let half_width = width / 2.0;
    let half_height = height / 2.0;
    
    let mut rng = rand::rng();

    for _ in 0..100 {
        let radius = rng.random_range(5.0..25.0);
        
        let x_extent = half_width - radius;
        let y_extent = half_height - radius;

        let x = rng.random_range(-x_extent..x_extent);
        let y = rng.random_range(-y_extent..y_extent);

        let velocity_x = rng.random_range(-200.0..200.0);
        let velocity_y = rng.random_range(-200.0..200.0);
        
        let color = Color::srgb(rng.random(), rng.random(), rng.random());

        spawn_circle(
            &mut commands,
            &mut meshes,
            &mut materials,
            Vec2::new(x, y),
            Vec2::new(velocity_x, velocity_y),
            radius,
            color,
        );
    }
}
