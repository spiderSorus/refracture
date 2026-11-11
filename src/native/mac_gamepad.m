#import <Foundation/Foundation.h>
#import <AppKit/AppKit.h>
#import <GameController/GameController.h>
#include <stdio.h>

static NSData *gLastJson = nil;
static CFAbsoluteTime gLastEmitTime = 0;

static NSDictionary *btnObj(GCControllerButtonInput *btn) {
    if (!btn) return @{ @"pressed": @NO, @"value": @(0.0) };
    return @{
        @"pressed": @(btn.isPressed),
        @"value": @(btn.value)
    };
}

static void emitControllers(BOOL force) {
    NSArray<GCController *> *controllers = [GCController controllers];
    NSMutableArray *out = [NSMutableArray arrayWithCapacity:controllers.count];

    NSUInteger idx = 0;
    for (GCController *ctrl in controllers) {
        GCExtendedGamepad *ext = ctrl.extendedGamepad;
        if (!ext) continue;

        NSString *name = ctrl.vendorName ?: @"Controller";
        NSString *cat = ctrl.productCategory ?: @"Xbox";
        NSString *padId = [NSString stringWithFormat:@"%@ (%@ STANDARD GAMEPAD)", name, cat];

        NSMutableArray *buttons = [NSMutableArray arrayWithCapacity:17];
        [buttons addObject:btnObj(ext.buttonA)];                     // 0: A
        [buttons addObject:btnObj(ext.buttonB)];                     // 1: B
        [buttons addObject:btnObj(ext.buttonX)];                     // 2: X
        [buttons addObject:btnObj(ext.buttonY)];                     // 3: Y
        [buttons addObject:btnObj(ext.leftShoulder)];                // 4: L1
        [buttons addObject:btnObj(ext.rightShoulder)];               // 5: R1
        [buttons addObject:btnObj(ext.leftTrigger)];                 // 6: L2
        [buttons addObject:btnObj(ext.rightTrigger)];                // 7: R2
        [buttons addObject:btnObj(ext.buttonOptions)];               // 8: Back / View
        [buttons addObject:btnObj(ext.buttonMenu)];                  // 9: Start / Menu
        [buttons addObject:btnObj(ext.leftThumbstickButton)];        // 10: L3
        [buttons addObject:btnObj(ext.rightThumbstickButton)];       // 11: R3
        [buttons addObject:btnObj(ext.dpad.up)];                     // 12: D-Pad Up
        [buttons addObject:btnObj(ext.dpad.down)];                   // 13: D-Pad Down
        [buttons addObject:btnObj(ext.dpad.left)];                   // 14: D-Pad Left
        [buttons addObject:btnObj(ext.dpad.right)];                  // 15: D-Pad Right
        [buttons addObject:btnObj(ext.buttonHome)];                  // 16: Guide / Home

        NSArray *axes = @[
            @(ext.leftThumbstick.xAxis.value),
            @(-ext.leftThumbstick.yAxis.value),
            @(ext.rightThumbstick.xAxis.value),
            @(-ext.rightThumbstick.yAxis.value)
        ];

        [out addObject:@{
            @"id": padId,
            @"index": @(idx),
            @"connected": @YES,
            @"mapping": @"standard",
            @"buttons": buttons,
            @"axes": axes
        }];
        idx++;
    }

    NSError *err = nil;
    NSData *json = [NSJSONSerialization dataWithJSONObject:out options:0 error:&err];
    if (json && !err) {
        CFAbsoluteTime now = CFAbsoluteTimeGetCurrent();
        if (force || !gLastJson || ![json isEqualToData:gLastJson] || (now - gLastEmitTime) > 0.5) {
            gLastJson = [json copy];
            gLastEmitTime = now;
            fwrite(json.bytes, 1, json.length, stdout);
            fputc('\n', stdout);
            fflush(stdout);
        }
    }
}

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        [NSApplication sharedApplication];
        [NSApp setActivationPolicy:NSApplicationActivationPolicyProhibited];

        if (@available(macOS 11.3, *)) {
            GCController.shouldMonitorBackgroundEvents = YES;
        }

        [GCController startWirelessControllerDiscoveryWithCompletionHandler:^{}];

        NSNotificationCenter *nc = [NSNotificationCenter defaultCenter];
        [nc addObserverForName:GCControllerDidConnectNotification
                        object:nil
                         queue:[NSOperationQueue mainQueue]
                    usingBlock:^(NSNotification *note) {
            GCController *ctrl = note.object;
            if (ctrl.extendedGamepad) {
                ctrl.extendedGamepad.valueChangedHandler = ^(GCExtendedGamepad *gamepad, GCControllerElement *element) {
                    emitControllers(NO);
                };
            }
            emitControllers(YES);
        }];

        [nc addObserverForName:GCControllerDidDisconnectNotification
                        object:nil
                         queue:[NSOperationQueue mainQueue]
                    usingBlock:^(NSNotification *note) {
            emitControllers(YES);
        }];

        [NSTimer scheduledTimerWithTimeInterval:(1.0 / 120.0)
                                        repeats:YES
                                          block:^(NSTimer *timer) {
            emitControllers(NO);
        }];

        [[NSRunLoop mainRunLoop] run];
    }
    return 0;
}
