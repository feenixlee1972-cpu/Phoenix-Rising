package com.phoenixrises.app;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import org.json.JSONObject;

public class MainActivity extends Activity {
  private String readAsset(String name) {
    try {
      InputStream in = getAssets().open(name);
      ByteArrayOutputStream out = new ByteArrayOutputStream();
      byte[] buf = new byte[4096];
      int n;
      while ((n = in.read(buf)) != -1) out.write(buf, 0, n);
      in.close();
      return out.toString("UTF-8");
    } catch (Exception e) {
      return "";
    }
  }

  @Override public void onCreate(Bundle b) {
    super.onCreate(b);
    final WebView w = new WebView(this);
    w.setWebViewClient(new WebViewClient() {
      @Override public void onPageFinished(WebView view, String url) {
        super.onPageFinished(view, url);
        String script = readAsset("enhancements.js");
        if (!script.isEmpty()) {
          view.evaluateJavascript("eval(" + JSONObject.quote(script) + ")", null);
        }
      }
    });
    WebSettings s = w.getSettings();
    s.setJavaScriptEnabled(true);
    s.setDomStorageEnabled(true);
    s.setBuiltInZoomControls(false);
    w.loadUrl("file:///android_asset/index.html");
    setContentView(w);
  }
}
