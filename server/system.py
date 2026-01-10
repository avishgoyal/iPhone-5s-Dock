# System related utilities and functions

#OpenApp Function For opening apps on iPhone 5s Dock
import os
import subprocess


base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def openApp(app_name):
    app_path = os.path.join(base_dir, "server", "shortcuts", f"{app_name}.desktop")
    if os.path.exists(app_path):
        try:
            print(f"Opening app: {app_name}")
            subprocess.Popen(["dex", app_path], cwd="/", start_new_session=True)
        except Exception as e:
            print(f"Error opening app {app_name}: {e}")
    else:
        print(f"App shortcut not found: {app_path}")


#v4l2l function For Camera Spoofing
def setup_v4l2():
    print("Initializing V4L2 Loopback for Discord...")
    try:
        # -r removes the module first to reset it
        subprocess.run(["sudo", "modprobe", "-r", "v4l2loopback"], check=False)
        # Apply the Discord-friendly settings
        subprocess.run(
            [
                "sudo",
                "modprobe",
                "v4l2loopback",
                "video_nr=10",
                "card_label=Arch Video Loopback",
                "exclusive_caps=1",
            ],
            check=True,
        )
        print("V4L2 Device /dev/video10 is ready!")
    except Exception as e:
        print(f"Failed to setup V4L2: {e}")