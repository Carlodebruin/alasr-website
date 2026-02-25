import os
import pty
import time
import sys

# Credentials
HOST = "alasr.co.za"
USER = "alas9"
PASS = "Nimda123"
LOCAL_DIR = "out/"
REMOTE_DIR = "public_html/beta"

# Construct rsync command
# -avz: archive mode, verbose, compress
# -e ssh: use ssh
cmd = [
    "rsync", "-avz", 
    "-e", "ssh -o StrictHostKeyChecking=no", 
    LOCAL_DIR, 
    f"{USER}@{HOST}:{REMOTE_DIR}"
]

print(f"Deploying to {USER}@{HOST}:{REMOTE_DIR}...")

# Use pty to handle pseudo-terminal interaction for password
pid, fd = pty.fork()

if pid == 0:
    # Child process: run rsync
    try:
        os.execvp(cmd[0], cmd)
    except Exception as e:
        print(f"Error executing rsync: {e}")
        sys.exit(1)
else:
    # Parent process: handle interaction
    try:
        output = b""
        search_password = True
        
        while True:
            try:
                # Read 1 byte at a time to be responsive, or larger chunk?
                # 1024 is standard
                data = os.read(fd, 1024)
                if not data:
                    break
                
                # Print to stdout so we see progress
                sys.stdout.buffer.write(data)
                sys.stdout.flush()
                
                # Check for password prompt if we haven't sent it yet
                if search_password and (b"password:" in data.lower() or b"Password:" in data):
                    # Sleep slightly to ensure prompt is ready? usually not needed
                    time.sleep(0.1) 
                    print("\nSending password...")
                    os.write(fd, (PASS + "\n").encode())
                    search_password = False
                    
            except OSError:
                break
                
        # Wait for child to exit
        _, status = os.waitpid(pid, 0)
        exit_code = os.waitstatus_to_exitcode(status) if hasattr(os, 'waitstatus_to_exitcode') else (status >> 8)
        
        if exit_code == 0:
            print("\n✅ Deployment Successful!")
        else:
            print(f"\n❌ Deployment Failed with exit code {exit_code}")
            
    except Exception as e:
        print(f"Deployment script error: {e}")
