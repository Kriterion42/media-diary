package ru.kriterion.mediadiary

import android.annotation.SuppressLint
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.View
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import androidx.webkit.WebViewAssetLoader

/**
 * Полностью офлайн-обёртка над однофайловым приложением (assets/index.html).
 * Назад: закрывает шторку → сворачивает приложение. Экспорт (.md/.json) — в «Загрузки».
 * Смена обложки: file chooser (изображения).
 */
class MainActivity : AppCompatActivity() {

    private lateinit var web: WebView
    private var filePathCallback: ValueCallback<Array<Uri>>? = null

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val loader = WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()

        web = WebView(this)
        setContentView(web)
        val surface = androidx.core.content.ContextCompat.getColor(this, R.color.surface)
        window.statusBarColor = surface
        window.navigationBarColor = surface

        web.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            allowFileAccess = false
            allowContentAccess = false
            databaseEnabled = false
            cacheMode = android.webkit.WebSettings.LOAD_NO_CACHE
        }
        web.setBackgroundColor(surface)
        web.webViewClient = object : WebViewClient() {
            // Парсер: fetch("https://md-parser.local/p?u=<url>") выполняется Java-стороной (нет CORS)
            override fun shouldInterceptRequest(view: WebView, request: android.webkit.WebResourceRequest): android.webkit.WebResourceResponse? {
                loader.shouldInterceptRequest(request.url)?.let { return it }
                val u = request.url
                if (u.host == "md-parser.local" && u.path == "/p") {
                    return try {
                        val target = java.net.URLDecoder.decode(u.getQueryParameter("u") ?: "", "UTF-8")
                        val conn = java.net.URL(target).openConnection() as java.net.HttpURLConnection
                        conn.connectTimeout = 15000; conn.readTimeout = 25000
                        conn.instanceFollowRedirects = true
                        conn.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) MediaDiary/1.1")
                        val mime = conn.contentType ?: "text/html"
                        val charset = Regex("""charset=([\w-]+)""").find(mime)?.groupValues?.get(1) ?: "utf-8"
                        android.webkit.WebResourceResponse(mime, charset, conn.inputStream)
                    } catch (e: Exception) {
                        android.webkit.WebResourceResponse("text/plain", "utf-8",
                            java.io.ByteArrayInputStream("PARSER_ERROR: ${e.message}".toByteArray()))
                    }
                }
                return null
            }
            override fun shouldOverrideUrlLoading(view: WebView, request: android.webkit.WebResourceRequest): Boolean {
                val url = request.url
                return if (url.host != WebViewAssetLoader.DEFAULT_DOMAIN) {
                    try { startActivity(Intent(Intent.ACTION_VIEW, url)) } catch (_: Exception) { }
                    true
                } else false
            }
        }
        web.webChromeClient = object : WebChromeClient() {
            override fun onShowFileChooser(
                webView: WebView,
                callback: ValueCallback<Array<Uri>>,
                params: FileChooserParams
            ): Boolean {
                filePathCallback?.onReceiveValue(null)
                filePathCallback = callback
                return try {
                    val intent = params.createIntent().apply { type = "image/*" }
                    startActivityForResult(intent, FILE_CHOOSER_CODE)
                    true
                } catch (_: Exception) {
                    filePathCallback = null
                    false
                }
            }
        }

        web.setDownloadListener { url, _, _, _, _ ->
            if (url.startsWith("data:")) {
                try { saveDataUrl(url) } catch (_: Exception) { toast("Не удалось сохранить файл") }
            }
        }

        web.loadUrl("https://appassets.androidplatform.net/assets/index.html")

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                web.evaluateJavascript("(window.__back ? window.__back() : '0')") { res ->
                    val handled = res?.replace("\"", "")?.trim() == "1"
                    when {
                        handled -> { }                    // шторка закрылась в JS
                        web.canGoBack() -> web.goBack()
                        else -> moveTaskToBack(true)      // не выходим из приложения
                    }
                }
            }
        })
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode == FILE_CHOOSER_CODE) {
            val cb = filePathCallback
            filePathCallback = null
            cb?.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(resultCode, data))
        } else super.onActivityResult(requestCode, resultCode, data)
    }

    private fun saveDataUrl(url: String) {
        val comma = url.indexOf(',')
        val head = url.substring(5, comma)
        val mime = head.substringBefore(';').ifBlank { "application/octet-stream" }
        val bytes = android.util.Base64.decode(url.substringAfter("base64,"), android.util.Base64.DEFAULT)
        val frag = url.substringAfter('#', "")
        val name = if (frag.isNotBlank())
            java.net.URLDecoder.decode(frag, "UTF-8") else "GameJournal_${System.currentTimeMillis()}"
        val ext = when {
            mime.contains("markdown") -> ".md"
            mime.contains("json") -> ".json"
            mime.contains("jpeg") -> ".jpg"
            mime.contains("png") -> ".png"
            else -> ""
        }
        val safe = (if (name.endsWith(ext)) name else name + ext)
            .replace(Regex("[\\\\/:*?\"<>|]"), "_")
        val values = android.content.ContentValues().apply {
            put(android.provider.MediaStore.Downloads.DISPLAY_NAME, safe)
            put(android.provider.MediaStore.Downloads.MIME_TYPE, mime)
        }
        val uri = contentResolver.insert(android.provider.MediaStore.Downloads.EXTERNAL_CONTENT_URI, values)
            ?: throw IllegalStateException("MediaStore insert failed")
        contentResolver.openOutputStream(uri)?.use { it.write(bytes) }
        toast("Сохранено в «Загрузки»: $safe")
    }

    private fun toast(msg: String) = Toast.makeText(this, msg, Toast.LENGTH_LONG).show()

    override fun onDestroy() {
        web.apply { loadUrl("about:blank"); destroy() }
        super.onDestroy()
    }

    companion object { private const val FILE_CHOOSER_CODE = 100 }
}
