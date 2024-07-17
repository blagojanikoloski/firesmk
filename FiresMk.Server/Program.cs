
using FiresMk.Server.Data;
using FiresMk.Server.Services;
using Microsoft.EntityFrameworkCore;

namespace FiresMk.Server
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Configure the database context and connection string
            builder.Services.AddDbContext<FiresMkContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("FiresMkContext")));

            // Add services to the container.
            builder.Services.AddControllers();

            // Add HttpClient service
            builder.Services.AddHttpClient();

            // Register the Python script executor as a scoped service
            builder.Services.AddScoped<IPythonScriptExecutor, PythonScriptExecutor>();

            // Register the periodic background service
            builder.Services.AddHostedService<PeriodicPythonScriptRunner>();

            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();


            // Add CORS policy
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAnyOrigin",
                    builder => builder
                        .AllowAnyOrigin() // Allow requests from any origin
                        .AllowAnyHeader()
                        .AllowAnyMethod());
            });



            var app = builder.Build();

            app.UseDefaultFiles();
            app.UseStaticFiles();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            // Use the CORS policy
            app.UseCors("AllowAnyOrigin");


            app.UseAuthorization();


            app.MapControllers();

            app.MapFallbackToFile("/index.html");

            app.Run();
        }
    }
}
