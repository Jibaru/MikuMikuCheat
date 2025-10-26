//go:build windows

package main

import (
	"context"
	"fmt"
	"syscall"
	"time"
	"unsafe"
)

const (
	WDA_NONE               = 0x00000000
	WDA_MONITOR            = 0x00000001
	WDA_EXCLUDEFROMCAPTURE = 0x00000011

	// Window styles
	WS_EX_APPWINDOW  = 0x00040000
	WS_EX_TOOLWINDOW = 0x00000080
	WS_EX_LAYERED    = 0x00080000

	// ShowWindow constants
	SW_HIDE = 0
	SW_SHOW = 5

	// SetWindowPos constants
	HWND_TOPMOST   = ^uintptr(0) // -1
	HWND_NOTOPMOST = ^uintptr(1) // -2
	SWP_NOMOVE     = 0x0002
	SWP_NOSIZE     = 0x0001
	SWP_SHOWWINDOW = 0x0040

	// Layered window attributes
	LWA_ALPHA    = 0x00000002
	LWA_COLORKEY = 0x00000001
)

var (
	user32   = syscall.NewLazyDLL("user32.dll")
	kernel32 = syscall.NewLazyDLL("kernel32.dll")

	procSetWindowDisplayAffinity   = user32.NewProc("SetWindowDisplayAffinity")
	procGetWindowDisplayAffinity   = user32.NewProc("GetWindowDisplayAffinity")
	procFindWindowW                = user32.NewProc("FindWindowW")
	procIsWindowVisible            = user32.NewProc("IsWindowVisible")
	procGetLastError               = kernel32.NewProc("GetLastError")
	procGetWindowLongPtrW          = user32.NewProc("GetWindowLongPtrW")
	procSetWindowLongPtrW          = user32.NewProc("SetWindowLongPtrW")
	procShowWindow                 = user32.NewProc("ShowWindow")
	procSetWindowPos               = user32.NewProc("SetWindowPos")
	procSetLayeredWindowAttributes = user32.NewProc("SetLayeredWindowAttributes")
)

// setWindowsDisplayAffinity sets the window to be excluded from screen capture
func setWindowsDisplayAffinity(ctx context.Context) {
	go func() {
		var hwnd uintptr

		for i := 0; i < 20; i++ {
			hwnd = findWailsWindow("MikuMikuCheat")

			if hwnd != 0 {
				visible, _, _ := procIsWindowVisible.Call(hwnd)
				fmt.Printf("[Attempt %d] Found window handle: 0x%X, Visible: %v\n", i+1, hwnd, visible != 0)

				if visible != 0 {
					err := setDisplayAffinity(hwnd, WDA_EXCLUDEFROMCAPTURE)
					if err != nil {
						fmt.Printf("Error setting display affinity: %v\n", err)
					} else {
						fmt.Println("✓ Successfully set WDA_EXCLUDEFROMCAPTURE")

						var currentAffinity uint32
						ret, _, _ := procGetWindowDisplayAffinity.Call(hwnd, uintptr(unsafe.Pointer(&currentAffinity)))
						if ret != 0 {
							fmt.Printf("  Current display affinity: 0x%X\n", currentAffinity)
						}
					}
					break
				}
			}

			time.Sleep(200 * time.Millisecond)
		}

		if hwnd == 0 {
			fmt.Println("❌ Failed to find window after all attempts")
		}
	}()
}

// hideFromTaskbarWails hides the window from taskbar
func hideFromTaskbarWails(ctx context.Context) {
	go func() {
		time.Sleep(500 * time.Millisecond)

		hwnd := findWailsWindow("MikuMikuCheat")
		if hwnd != 0 {
			err := hideFromTaskbar(hwnd)
			if err != nil {
				fmt.Printf("Error hiding from taskbar: %v\n", err)
			} else {
				fmt.Println("✓ Successfully hidden from taskbar")
			}
		}
	}()
}

// setAlwaysOnTopWails sets the window to always be on top
func setAlwaysOnTopWails(ctx context.Context) {
	go func() {
		time.Sleep(600 * time.Millisecond)

		hwnd := findWailsWindow("MikuMikuCheat")
		if hwnd != 0 {
			err := setAlwaysOnTop(hwnd, true)
			if err != nil {
				fmt.Printf("Error setting always on top: %v\n", err)
			} else {
				fmt.Println("✓ Successfully set always on top")
			}
		}
	}()
}

// setWindowOpacityWails sets the window opacity
func setWindowOpacityWails(ctx context.Context, alpha uint8) {
	go func() {
		time.Sleep(700 * time.Millisecond)

		hwnd := findWailsWindow("MikuMikuCheat")
		if hwnd != 0 {
			err := setWindowOpacity(hwnd, alpha)
			if err != nil {
				fmt.Printf("Error setting window opacity: %v\n", err)
			} else {
				fmt.Printf("✓ Successfully set window opacity to %d/255 (~%d%%)\n", alpha, (int(alpha)*100)/255)
			}
		}
	}()
}

func setDisplayAffinity(hwnd uintptr, affinity uint32) error {
	ret, _, err := procSetWindowDisplayAffinity.Call(
		hwnd,
		uintptr(affinity),
	)

	if ret == 0 {
		lastErr, _, _ := procGetLastError.Call()
		return fmt.Errorf("SetWindowDisplayAffinity failed with error code: %d, syscall error: %v", lastErr, err)
	}
	return nil
}

func hideFromTaskbar(hwnd uintptr) error {
	const GWL_EXSTYLE = -20

	exStyle := getWindowLongPtr(hwnd, GWL_EXSTYLE)
	newStyle := (exStyle &^ WS_EX_APPWINDOW) | WS_EX_TOOLWINDOW
	setWindowLongPtr(hwnd, GWL_EXSTYLE, newStyle)

	procShowWindow.Call(hwnd, SW_HIDE)
	procShowWindow.Call(hwnd, SW_SHOW)

	return nil
}

// setAlwaysOnTop sets or removes the always on top property
func setAlwaysOnTop(hwnd uintptr, alwaysOnTop bool) error {
	var flag uintptr
	if alwaysOnTop {
		flag = HWND_TOPMOST
	} else {
		flag = HWND_NOTOPMOST
	}

	ret, _, err := procSetWindowPos.Call(
		hwnd,
		flag,
		0, 0, 0, 0,
		SWP_NOMOVE|SWP_NOSIZE|SWP_SHOWWINDOW,
	)

	if ret == 0 {
		return fmt.Errorf("SetWindowPos failed: %v", err)
	}
	return nil
}

// setWindowOpacity sets the window opacity (0-255, where 255 is fully opaque)
func setWindowOpacity(hwnd uintptr, alpha uint8) error {
	const GWL_EXSTYLE = -20

	// Get current extended window style
	exStyle := getWindowLongPtr(hwnd, GWL_EXSTYLE)

	// Add WS_EX_LAYERED style if not present
	if (exStyle & WS_EX_LAYERED) == 0 {
		newStyle := exStyle | WS_EX_LAYERED
		setWindowLongPtr(hwnd, GWL_EXSTYLE, newStyle)
	}

	// Set the layered window attributes
	ret, _, err := procSetLayeredWindowAttributes.Call(
		hwnd,
		0,              // crKey (color key, not used)
		uintptr(alpha), // bAlpha (0-255)
		LWA_ALPHA,      // dwFlags
	)

	if ret == 0 {
		return fmt.Errorf("SetLayeredWindowAttributes failed: %v", err)
	}
	return nil
}

func getWindowLongPtr(hwnd uintptr, index int) uintptr {
	ret, _, _ := procGetWindowLongPtrW.Call(
		hwnd,
		uintptr(index),
	)
	return ret
}

func setWindowLongPtr(hwnd uintptr, index int, newLong uintptr) uintptr {
	ret, _, _ := procSetWindowLongPtrW.Call(
		hwnd,
		uintptr(index),
		newLong,
	)
	return ret
}

func findWailsWindow(title string) uintptr {
	titlePtr, _ := syscall.UTF16PtrFromString(title)
	hwnd, _, _ := procFindWindowW.Call(
		0,
		uintptr(unsafe.Pointer(titlePtr)),
	)
	return hwnd
}
