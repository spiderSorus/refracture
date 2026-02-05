use bevy::prelude::*;
use crate::components::{Velocity, CircleCollider};

pub fn bounce_system(
    window_query: Query<&Window, With<bevy::window::PrimaryWindow>>,
    mut query: Query<(&mut Transform, &mut Velocity, &CircleCollider)>,
) {
    let Some(window) = window_query.iter().next() else { return; };
    let width = window.width();
    let height = window.height();
    let half_width = width / 2.0;
    let half_height = height / 2.0;

    for (mut transform, mut velocity, collider) in query.iter_mut() {
        let x_extent = half_width - collider.radius;
        if transform.translation.x.abs() > x_extent {
            velocity.0.x *= -1.0;
            transform.translation.x = x_extent * transform.translation.x.signum();
        }

        let y_extent = half_height - collider.radius;
        if transform.translation.y.abs() > y_extent {
            velocity.0.y *= -1.0;
            transform.translation.y = y_extent * transform.translation.y.signum();
        }
    }
}
