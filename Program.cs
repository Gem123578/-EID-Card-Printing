using EIDCardPrint.Services;
using EIDCardPrint.Utils;
using log4net;
using log4net.Config;
using System.Reflection;

var logRepository =
    LogManager.GetRepository(
        Assembly.GetEntryAssembly()
    );


XmlConfigurator.Configure(
    logRepository,
    new FileInfo("log4net.config")
);

var builder = WebApplication.CreateBuilder(args);

//DI services
builder.Services.AddScoped<ILogFactory, LogFactory>();

builder.Services.AddScoped<IAPIAccessHelper, APIAccessHelper>();

builder.Services.AddScoped<ILoginUserServices, LoginUserServices>();

builder.Services.AddScoped<IDateRange, DateRange>();

builder.Services.AddScoped<IApplicantServices, ApplicantServices>();

builder.Services.AddHttpClient<IOfficeServices, OfficeServices>();



builder.Services.AddHttpContextAccessor();

builder.Services.AddSession();

builder.Services.AddScoped<IApplicantServices, ApplicantServices>();
// Add services to the container.
builder.Services.AddRazorPages();

builder.Services.AddControllersWithViews();

var app = builder.Build();


// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

app.UseSession();

app.UseAuthorization();

app.MapStaticAssets();
app.MapRazorPages()
   .WithStaticAssets();


app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Login}/{id?}");
app.Run();
